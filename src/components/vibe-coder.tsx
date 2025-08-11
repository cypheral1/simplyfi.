"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
import { Bot, Play, Save, FolderOpen, Download, Loader2, Python } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCodeAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';

type Language = 'javascript' | 'python' | 'html';
type SavedSnippet = {
  id: string;
  name: string;
  prompt: string;
  code: string;
  language: Language;
};

export default function VibeCoder() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string>('');
  const [savedSnippets, setSavedSnippets] = useState<SavedSnippet[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [isGenerating, startGenerateTransition] = useTransition();
  const { toast } = useToast();
  const outputRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    try {
      const storedSnippets = localStorage.getItem('vibeCoderSnippets');
      if (storedSnippets) {
        setSavedSnippets(JSON.parse(storedSnippets));
      }
    } catch (error) {
      console.error("Failed to load snippets from localStorage", error);
      toast({
        title: "Error",
        description: "Could not load saved snippets.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleGenerateCode = () => {
    if (!prompt) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate code.',
        variant: 'destructive',
      });
      return;
    }
    startGenerateTransition(async () => {
      const result = await generateCodeAction({ prompt, language });
      if (result.success && result.code) {
        setCode(result.code);
        toast({
          title: 'Code Generated',
          description: 'The AI has finished generating your code.',
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  const handleExecuteCode = () => {
    setOutput('');
    if (language === 'javascript') {
      try {
        const originalLog = console.log;
        let logs: string[] = [];
        console.log = (...args) => {
          logs.push(args.map(arg => JSON.stringify(arg, null, 2)).join(' '));
        };
        const result = new Function(code)();
        console.log = originalLog;
        let finalOutput = logs.join('\n');
        if(result !== undefined) {
          finalOutput += `\n\n// Return value:\n${JSON.stringify(result, null, 2)}`;
        }
        setOutput(finalOutput || 'Code executed successfully with no output.');
      } catch (error: any) {
        setOutput(`Error: ${error.message}`);
      }
    } else if (language === 'html') {
      if (outputRef.current && outputRef.current.contentWindow) {
        outputRef.current.srcdoc = code;
      }
    } else if (language === 'python') {
      toast({
        title: 'Execution not supported',
        description: 'Python execution is not available in the browser.',
      });
      setOutput('Python execution is not supported in this environment.');
    }
  };

  const handleSaveCode = () => {
    const name = window.prompt("Enter a name for your snippet:");
    if (name) {
      const newSnippet: SavedSnippet = {
        id: Date.now().toString(),
        name,
        prompt,
        code,
        language,
      };
      const updatedSnippets = [...savedSnippets, newSnippet];
      setSavedSnippets(updatedSnippets);
      localStorage.setItem('vibeCoderSnippets', JSON.stringify(updatedSnippets));
      toast({ title: 'Snippet Saved!', description: `"${name}" has been saved.`});
    }
  };

  const handleLoadSnippet = (snippet: SavedSnippet) => {
    setPrompt(snippet.prompt);
    setCode(snippet.code);
    setLanguage(snippet.language);
    setIsDialogOpen(false);
    toast({ title: 'Snippet Loaded!', description: `"${snippet.name}" has been loaded.`});
  };

  const handleDownload = () => {
    const fileExtensionMap = {
      javascript: '.js',
      python: '.py',
      html: '.html',
    };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-coder-snippet${fileExtensionMap[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleDeleteSnippet = (snippetId: string) => {
    const updatedSnippets = savedSnippets.filter(s => s.id !== snippetId);
    setSavedSnippets(updatedSnippets);
    localStorage.setItem('vibeCoderSnippets', JSON.stringify(updatedSnippets));
    toast({ title: 'Snippet Deleted!' });
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 h-full flex flex-col gap-4">
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start">
          <Textarea
            placeholder="Enter your prompt here to generate code..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 text-base resize-none"
            rows={3}
          />
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateCode} disabled={isGenerating} className="w-full md:w-auto">
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Code Editor</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleExecuteCode} title="Execute Code"><Play className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={handleSaveCode} title="Save Snippet"><Save className="h-4 w-4" /></Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="Load Snippet"><FolderOpen className="h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>Load Snippet</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-72">
                    <div className="space-y-2 p-4">
                      {savedSnippets.length > 0 ? savedSnippets.map((snippet) => (
                        <div key={snippet.id} className="flex items-center justify-between p-2 rounded-lg border">
                          <span className="font-medium">{snippet.name}</span>
                          <div className='flex gap-2'>
                            <Button size="sm" onClick={() => handleLoadSnippet(snippet)}>Load</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteSnippet(snippet.id)}>Delete</Button>
                          </div>
                        </div>
                      )) : <p className="text-muted-foreground text-center">No saved snippets yet.</p>}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="icon" onClick={handleDownload} title="Download Code"><Download className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full h-full font-code text-sm resize-none border-0 rounded-t-none focus-visible:ring-0"
              placeholder="// Your generated code will appear here..."
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 bg-muted/30 rounded-b-lg overflow-auto">
            {language === 'html' ? (
              <iframe
                ref={outputRef}
                title="HTML Output"
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts"
              />
            ) : (
              <pre className="text-sm p-4 whitespace-pre-wrap break-words">
                <code>{output || '// Output will be displayed here...'}</code>
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


"use client";

import { useState, useTransition, useRef, useEffect } from 'react';
import { conversationalCodeGenerationAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Send, User, Bot, Loader2, Code, Brush, Zap, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useChatStore, type Message } from '@/stores/chat-store';

const promptSuggestions = [
    { icon: <Code className="h-4 w-4" />, text: 'Generate a Python function' },
    { icon: <Brush className="h-4 w-4" />, text: 'Create a React component' },
    { icon: <Zap className="h-4 w-4" />, text: 'Explain a code snippet' },
]

export default function ChatInterface() {
  const { messages, addMessage } = useChatStore();
  const [input, setInput] = useState('');
  const [isGenerating, startGenerateTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { role: 'user', content: input };
    addMessage(userMessage);
    setInput('');
    
    startGenerateTransition(async () => {
      const result = await conversationalCodeGenerationAction({ prompt: input });
      if (result.success && result.response) {
        const assistantMessage: Message = { role: 'assistant', content: result.response };
        addMessage(assistantMessage);
      } else {
        toast({
          title: 'An error occurred',
          description: result.error || 'Failed to get a response.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // TODO: Handle file upload and processing
        toast({
            title: "File Selected",
            description: `You have selected ${file.name}. Attachment processing is not yet implemented.`,
        });
    }
  }


  return (
    <div className="flex flex-col h-full bg-background rounded-xl border shadow-lg">
       <div className="flex-1 p-6 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            {messages.length === 0 && !isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <Avatar className="h-16 w-16 mb-4">
                        <AvatarFallback className="bg-primary/10"><Bot size={40} className="text-primary" /></AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
                    <div className="flex gap-4 mt-4">
                        {promptSuggestions.map((prompt, index) => (
                             <Button key={index} variant="outline" className="gap-2" onClick={() => setInput(prompt.text)}>
                                {prompt.icon}
                                {prompt.text}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                {messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
                    {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 border">
                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn(
                        "max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap font-code",
                        message.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}>
                        {message.content}
                    </div>
                    {message.role === 'user' && (
                        <Avatar className="h-8 w-8 border">
                            <AvatarFallback><User size={20} /></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                    {isGenerating && (
                        <div className="flex items-start gap-4">
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback><Bot size={20} /></AvatarFallback>
                            </Avatar>
                            <div className="max-w-[80%] rounded-lg p-3 text-sm bg-muted flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div ref={messagesEndRef} />
        </ScrollArea>
       </div>
       <div className="px-4 pb-4 pt-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to generate some code..."
            className="w-full min-h-[44px] max-h-48 resize-none rounded-xl border border-input bg-transparent py-3 pl-4 pr-24 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            rows={1}
            disabled={isGenerating}
          />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleAttachmentClick}
            disabled={isGenerating}
            className="absolute bottom-2 right-12 h-8 w-8 rounded-lg"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isGenerating}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
       </div>
    </div>
  );
}

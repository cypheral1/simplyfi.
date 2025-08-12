"use client";

import { useState, useTransition, useRef, useEffect } from 'react';
import { conversationalCodeGenerationAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Send, User, Bot, Loader2, Code, Brush, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const promptSuggestions = [
    { icon: <Code className="h-4 w-4" />, text: 'Generate a Python function' },
    { icon: <Brush className="h-4 w-4" />, text: 'Create a React component' },
    { icon: <Zap className="h-4 w-4" />, text: 'Explain a code snippet' },
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, startGenerateTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    startGenerateTransition(async () => {
      const result = await conversationalCodeGenerationAction({ prompt: input });
      if (result.success && result.response) {
        const assistantMessage: Message = { role: 'assistant', content: result.response };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        toast({
          title: 'An error occurred',
          description: result.error || 'Failed to get a response.',
          variant: 'destructive',
        });
        setMessages(prev => prev.slice(0, prev.length - 1));
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };


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
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="relative">
            <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me to generate some code..."
            className="flex-1 resize-none pr-16"
            rows={2}
            disabled={isGenerating}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isGenerating} className="absolute bottom-2.5 right-2.5">
            <Send className="h-4 w-4" />
            </Button>
        </form>
      </div>
    </div>
  );
}

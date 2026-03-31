'use client';
import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '~/lib/api';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent } from '~/components/ui/card';
import { Bot, User, CornerDownLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
interface Message { role: 'user' | 'assistant'; content: string; }
export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Hello! I am your AI legal assistant. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollRef.current) { scrollRef.current.scrollTop = scrollRef.current.scrollHeight; } }, [messages]);
  const chatMutation = useMutation({
    mutationFn: (newMessages: Message[]) => {
      const userMessage = newMessages[newMessages.length - 1];
      const history = newMessages.slice(0, -1);
      return apiClient.post('/chatbot/chat', { message: userMessage.content, history });
    },
    onSuccess: (data) => { setMessages((prev) => [...prev, { role: 'assistant', content: data.data.response }]); },
    onError: () => { setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]); }
  });
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    chatMutation.mutate(newMessages);
  };
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-4">AI Legal Assistant</h1>
      <Card className="flex-1 flex flex-col">
        <CardContent ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && <div className="p-2 rounded-full bg-primary/10 flex-shrink-0"><Bot className="h-6 w-6 text-primary" /></div>}
              <div className={`rounded-lg p-3 max-w-[85%] prose dark:prose-invert max-w-none text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><ReactMarkdown>{msg.content}</ReactMarkdown></div>
              {msg.role === 'user' && <div className="p-2 rounded-full bg-muted flex-shrink-0"><User className="h-6 w-6" /></div>}
            </div>
          ))}
          {chatMutation.isPending && (<div className="flex items-start gap-4"><div className="p-2 rounded-full bg-primary/10 flex-shrink-0"><Bot className="h-6 w-6 text-primary" /></div><div className="rounded-lg p-3 bg-muted animate-pulse">Typing...</div></div>)}
        </CardContent>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSend} className="relative">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question about Indian law..." disabled={chatMutation.isPending} className="pr-12" />
            <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7" disabled={chatMutation.isPending}><CornerDownLeft className="h-4 w-4" /></Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

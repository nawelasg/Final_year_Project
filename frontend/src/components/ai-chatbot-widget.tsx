'use client';
import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '~/lib/api';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Bot, User, CornerDownLeft, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message { role: 'user' | 'assistant'; content: string; }

export function AiChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Hello! How can I assist you with your legal questions?' }]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const chatMutation = useMutation({
    mutationFn: (newMessages: Message[]) => {
      const userMessage = newMessages[newMessages.length - 1];
      const history = newMessages.slice(0, -1);
      return apiClient.post('/chatbot/chat', { message: userMessage.content, history });
    },
    onSuccess: (data) => { setMessages((prev) => [...prev, { role: 'assistant', content: data.data.response }]); },
    onError: () => { setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, an error occurred.' }]); }
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
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="rounded-full w-14 h-14 shadow-lg">
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </Button>
      </div>
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-full max-w-sm sm:max-w-md h-[70vh] max-h-[700px] flex flex-col shadow-2xl animate-in fade-in-90 slide-in-from-bottom-10">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg">AI Legal Assistant</CardTitle>
          </CardHeader>
          <CardContent ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && <div className="p-2 rounded-full bg-primary/10 flex-shrink-0"><Bot className="h-5 w-5 text-primary" /></div>}
                <div className={`rounded-lg p-3 max-w-[85%] text-sm prose dark:prose-invert max-w-none ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === 'user' && <div className="p-2 rounded-full bg-muted flex-shrink-0"><User className="h-5 w-5" /></div>}
              </div>
            ))}
            {chatMutation.isPending && (<div className="flex items-start gap-3"><div className="p-2 rounded-full bg-primary/10 flex-shrink-0"><Bot className="h-5 w-5 text-primary" /></div><div className="rounded-lg p-3 bg-muted flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Thinking...</div></div>)}
          </CardContent>
          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSend} className="relative">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." disabled={chatMutation.isPending} className="pr-12" />
              <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7" disabled={chatMutation.isPending}><CornerDownLeft className="h-4 w-4" /></Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}

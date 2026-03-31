'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '~/lib/api';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Bot, User, CornerDownLeft, Sparkles, Scale, MessageSquareText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const starterPrompts = [
  'What are the important clauses in a rent agreement?',
  'Explain confidentiality obligations in an NDA.',
  'What should be included in an affidavit?',
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your AI legal assistant. Ask me about legal drafting, clauses, agreements, affidavits, or general legal-document structure related to India.',
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: (newMessages: Message[]) => {
      const userMessage = newMessages[newMessages.length - 1];
      const history = newMessages.slice(0, -1);
      return apiClient.post('/chatbot/chat', { message: userMessage.content, history });
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.data.response }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    chatMutation.mutate(newMessages);
  };

  const handleQuickPrompt = (prompt: string) => {
    if (chatMutation.isPending) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: prompt }];
    setMessages(newMessages);
    setInput('');
    chatMutation.mutate(newMessages);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wider text-slate-200">
              <Sparkles className="h-3.5 w-3.5" />
              AI Legal Assistant
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Ask legal drafting and clause-related questions</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Use the chatbot to understand document clauses, legal wording, and common drafting concepts.
              For official or sensitive matters, consult a qualified legal professional.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <MessageSquareText className="h-4 w-4" />
              Suggested Questions
            </div>
            <div className="space-y-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Card className="mx-auto flex h-[calc(100vh-18rem)] max-w-5xl flex-col overflow-hidden rounded-3xl border shadow-lg">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle>Conversation</CardTitle>
          <CardDescription>
            Ask about agreement clauses, affidavit structure, document wording, or general Indian legal drafting help.
          </CardDescription>
        </CardHeader>

        <CardContent ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto bg-[linear-gradient(to_bottom,transparent,transparent),radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_35%)] p-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'border bg-card text-foreground'
                }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-muted shadow-sm">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                Thinking...
              </div>
            </div>
          )}
        </CardContent>

        <div className="border-t bg-background p-4">
          <form onSubmit={handleSend} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about Indian legal drafting, clauses, or agreements..."
              disabled={chatMutation.isPending}
              className="h-12 rounded-xl pr-14"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg"
              disabled={chatMutation.isPending}
            >
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

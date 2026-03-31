'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import apiClient from '~/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Scale } from 'lucide-react';

const formSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function AuthForm({ isSignup = false }: { isSignup?: boolean }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', full_name: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const payload = isSignup ? values : { email: values.email, password: values.password };
      return apiClient.post(endpoint, payload);
    },
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.data.access_token);
      toast.success(isSignup ? 'Account created successfully!' : 'Login successful!');
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
      toast.error(errorMessage);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-6">
        <div className="hidden md:block">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm text-muted-foreground">
              <Scale className="h-4 w-4 text-primary" />
              LegalPro AI Workspace
            </div>

            <h1 className="text-4xl font-bold tracking-tight">
              Draft legal documents with a cleaner and smarter workflow
            </h1>

            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Generate structured legal drafts, review AI-based analysis, explain clauses in plain language,
              and export formal print-ready legal documents from one workspace.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <p className="font-medium">AI-assisted legal drafting</p>
                <p className="mt-1 text-sm text-muted-foreground">Generate formal legal-document drafts for common use cases.</p>
              </div>
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <p className="font-medium">Structured review tools</p>
                <p className="mt-1 text-sm text-muted-foreground">Use risk analysis, clause explanation, and validation support.</p>
              </div>
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <p className="font-medium">Print-ready legal formatting</p>
                <p className="mt-1 text-sm text-muted-foreground">Review and export drafts in a formal legal layout.</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Scale className="h-6 w-6" />
            </div>
            <CardTitle>{isSignup ? 'Create an Account' : 'Welcome Back'}</CardTitle>
            <CardDescription>Enter your details to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
                {isSignup && (
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} required /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="name@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <Link href={isSignup ? '/login' : '/signup'} className="font-medium underline underline-offset-4">
                {isSignup ? 'Login' : 'Sign Up'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

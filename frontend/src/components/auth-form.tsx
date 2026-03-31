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
      // Remove full_name for login requests
      const payload = isSignup ? values : { email: values.email, password: values.password };
      return apiClient.post(endpoint, payload);
    },
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.data.access_token);
      toast.success(isSignup ? 'Account created successfully!' : 'Login successful!');
      router.push('/dashboard');
      router.refresh(); // Force a refresh to ensure the new layout loads
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
      toast.error(errorMessage);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{isSignup ? 'Create an Account' : 'Welcome Back'}</CardTitle>
          <CardDescription>Enter your details to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(mutation.mutate)} className="space-y-4">
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
            <Link href={isSignup ? '/login' : '/signup'} className="underline">
              {isSignup ? 'Login' : 'Sign Up'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

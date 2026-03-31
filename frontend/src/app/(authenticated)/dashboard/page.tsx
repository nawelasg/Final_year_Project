'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '~/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { FilePlus, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function DashboardPage() {
  const { data: templates, isLoading, isError } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => apiClient.get('/templates').then(res => res.data),
  });

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Document Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Choose a template to start generating your legal document. Your generated documents are never saved.
      </p>

      {isLoading && (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading templates...
        </div>
      )}
      {isError && <p className="text-destructive">Failed to load templates. The backend server may be offline.</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link href={`/create/${template.id}`} className="block">
                <Button className="w-full">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

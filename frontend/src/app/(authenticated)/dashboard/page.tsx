'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  FilePlus,
  Loader2,
  Sparkles,
  ShieldCheck,
  FileText,
  Briefcase,
  Building2,
  Landmark,
  Wallet,
  Scale,
  History,
  Clock3,
  ArrowRight,
} from 'lucide-react';
import apiClient from '~/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RecentTemplate {
  template_id: string;
  template_name: string;
  used_at: string;
}

const categoryStyles: Record<string, string> = {
  Property: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  Business: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
  General: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  Employment: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  Authority: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
  Finance: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
};

function getTemplateIcon(category: string) {
  switch (category) {
    case 'Property':
      return Building2;
    case 'Business':
      return Briefcase;
    case 'Authority':
      return Landmark;
    case 'Finance':
      return Wallet;
    case 'Employment':
      return ShieldCheck;
    case 'General':
      return FileText;
    default:
      return FileText;
  }
}

function formatUsedAt(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardPage() {
  const { data: templates, isLoading, isError } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => apiClient.get('/templates').then((res) => res.data),
  });

  const { data: recentTemplates, isLoading: isRecentLoading } = useQuery<RecentTemplate[]>({
    queryKey: ['recent-templates'],
    queryFn: async () => apiClient.get('/history/templates').then((res) => res.data),
  });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wider text-slate-200">
              <Sparkles className="h-3.5 w-3.5" />
              Legal Drafting Dashboard
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Create professional legal drafts from guided templates</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Select a template, provide the necessary details, generate a structured legal draft,
              review AI insights, and export a formal print-ready version.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Scale className="h-4 w-4" />
                Legal Formatting
              </div>
              <p className="text-xs leading-6 text-slate-300">
                Formal legal-document layout with print / save PDF support.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4" />
                AI Review Tools
              </div>
              <p className="text-xs leading-6 text-slate-300">
                Risk analysis, clause explanation, and structural validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recently Used Templates</h2>
          <p className="text-sm text-muted-foreground">
            Your recent drafting activity is stored as lightweight template history only, not document content.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            {isRecentLoading ? (
              <div className="flex items-center px-6 py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading recent activity...
              </div>
            ) : recentTemplates && recentTemplates.length > 0 ? (
              <div className="divide-y">
                {recentTemplates.map((item, index) => (
                  <div
                    key={`${item.template_id}-${item.used_at}-${index}`}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        <p className="font-medium">{item.template_name}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>{formatUsedAt(item.used_at)}</span>
                      </div>
                    </div>

                    <Link href={`/create/${item.template_id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        Reuse Template
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-sm text-muted-foreground">
                No recent template activity yet. Generate a document to start building your drafting history.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Document Templates</h2>
            <p className="text-sm text-muted-foreground">
              Choose a document type to begin drafting. Your generated documents are not saved by default.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center rounded-xl border bg-card px-4 py-6 text-muted-foreground shadow-sm">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading templates...
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-destructive">
            Failed to load templates. The backend server may be offline.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates?.map((template) => {
            const Icon = getTemplateIcon(template.category);

            return (
              <Card
                key={template.id}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        categoryStyles[template.category] || 'border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      {template.category}
                    </span>
                  </div>

                  <div>
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-6">{template.description}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="mt-auto">
                  <Link href={`/create/${template.id}`} className="block">
                    <Button className="w-full gap-2">
                      <FilePlus className="h-4 w-4" />
                      Create Document
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

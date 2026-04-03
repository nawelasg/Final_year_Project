import Link from 'next/link';
import { Scale, FileText, ShieldCheck, Sparkles, MessageSquareText, ArrowRight, BadgeCheck } from 'lucide-react';
import { Button } from '~/components/ui/button';

const features = [
  {
    icon: FileText,
    title: 'AI Legal Drafting',
    description: 'Generate formal legal drafts for common Indian legal-document use cases in minutes.',
  },
  {
    icon: MessageSquareText,
    title: 'Clause Explanations',
    description: 'Select complex clauses and get simplified explanations in plain language.',
  },
  {
    icon: ShieldCheck,
    title: 'Structured Review',
    description: 'Get AI-assisted summaries, validation, and drafting support before final legal review.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">LegalPro AI</p>
              <p className="text-xs text-muted-foreground">AI-Powered Legal Drafting Assistant</p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.14),transparent_28%)]" />
          <div className="container relative mx-auto px-4 py-20 md:px-6 md:py-28">
            <div className="mx-auto max-w-5xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Final Year Project • Legal AI Assistant for India
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Draft Legal Documents
                <span className="block bg-gradient-to-r from-primary via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  Faster, Smarter, and More Clearly
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                LegalPro AI helps users generate structured legal drafts, understand complex clauses,
                and interact with an AI legal assistant using a clean and professional drafting workflow.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="min-w-44">
                    Start Drafting
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="min-w-44">
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="mt-14 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border bg-background/80 p-5 text-left shadow-sm backdrop-blur">
                  <p className="text-3xl font-bold">8+</p>
                  <p className="mt-2 text-sm text-muted-foreground">Core legal document templates ready for drafting</p>
                </div>
                <div className="rounded-2xl border bg-background/80 p-5 text-left shadow-sm backdrop-blur">
                  <p className="text-3xl font-bold">AI</p>
                  <p className="mt-2 text-sm text-muted-foreground">Draft generation, clause explanation, validation, and risk analysis workflow</p>
                </div>
                <div className="rounded-2xl border bg-background/80 p-5 text-left shadow-sm backdrop-blur">
                  <p className="text-3xl font-bold">Print-ready</p>
                  <p className="mt-2 text-sm text-muted-foreground">Formal legal-document preview with PDF-friendly formatting</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
              Key Capabilities
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Designed for clarity, structure, and legal drafting support</h2>
            <p className="mt-4 text-muted-foreground">
              Built to simplify common legal drafting tasks while keeping the experience understandable for non-lawyers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20 md:px-6">
          <div className="rounded-3xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-10 text-white shadow-xl md:px-10">
            <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wider text-slate-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Legal AI Workflow
                </div>
                <h3 className="text-2xl font-bold md:text-3xl">Generate, review, explain, and export legal drafts in one place</h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  From document drafting to clause clarification and formal print-ready formatting,
                  the platform is designed to assist users through the full legal-document preparation journey.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="space-y-4">
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">Draft legal agreements</p>
                    <p className="mt-1 text-xs text-slate-300">Structured generation for common legal templates</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">Understand legal language</p>
                    <p className="mt-1 text-xs text-slate-300">Clause explanation and summary assistance</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">Export professionally</p>
                    <p className="mt-1 text-xs text-slate-300">Formal preview with print / save PDF workflow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:px-6">
          <p>&copy; 2025 LegalPro AI. All rights reserved.</p>
          <p className="md:ml-auto">Project ID: SKIT/AI/2022-2026/19</p>
        </div>
      </footer>
    </div>
  );
}

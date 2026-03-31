'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '~/lib/api';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Separator } from '~/components/ui/separator';
import { Label } from '~/components/ui/label';
import {
  Sparkles,
  Loader2,
  Pencil,
  Check,
  Printer,
  Copy,
  ShieldAlert,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog';

interface RiskAnalysis {
  risk_level: 'Low' | 'Medium' | 'High';
  summary: string;
  issues: string[];
  suggestions: string[];
}

const riskStyles: Record<string, string> = {
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Medium: 'border-amber-200 bg-amber-50 text-amber-800',
  High: 'border-rose-200 bg-rose-50 text-rose-800',
};

function getPreview(text: string, maxLength = 140) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
}

export default function CreateDocumentPage() {
  const params = useParams();
  const templateId = params.id as string;
  const form = useForm();

  const [documentTitle, setDocumentTitle] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [summary, setSummary] = useState('');
  const [validationReport, setValidationReport] = useState('');
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [explanation, setExplanation] = useState('');

  const [openAnalysisDialog, setOpenAnalysisDialog] = useState(false);
  const [openRiskDialog, setOpenRiskDialog] = useState(false);
  const [openValidationDialog, setOpenValidationDialog] = useState(false);

  const { data: template, isLoading: isTemplateLoading } = useQuery<any>({
    queryKey: ['template', templateId],
    queryFn: () =>
      apiClient.get(`/templates/${templateId}`).then((res) => {
        setDocumentTitle(res.data.name);
        return res.data;
      }),
    enabled: !!templateId,
  });

  const generateMutation = useMutation({
    mutationFn: (values: any) =>
      apiClient.post('/documents/generate', { template_id: templateId, field_values: values }),
    onSuccess: async (res) => {
      setEditableContent(res.data.content);
      setSummary(res.data.summary);
      setValidationReport(res.data.validation_report?.report_text || '');
      setRiskAnalysis(res.data.risk_analysis);
      setIsEditing(false);

      if (template?.id && template?.name) {
        try {
          await apiClient.post('/history/templates', {
            template_id: template.id,
            template_name: template.name,
          });
        } catch {
          // Silent fail: history is useful but should never break generation UX
        }
      }

      toast.success('Document generated successfully!');
    },
    onError: () => toast.error('Failed to generate document.'),
  });

  const titleMutation = useMutation({
    mutationFn: (values: any) =>
      apiClient.post('/documents/suggest-title', { template_type: template?.name, field_values: values }),
    onSuccess: (res) => {
      setDocumentTitle(res.data.title);
      toast.success('Title suggestion applied!');
    },
    onError: () => toast.error('Failed to suggest title.'),
  });

  const explainMutation = useMutation({
    mutationFn: (text: string) => apiClient.post('/documents/explain-clause', { clause_text: text }),
    onSuccess: (res) => setExplanation(res.data.explanation),
    onError: () => toast.error('Failed to explain clause.'),
  });

  const handleMouseUp = () => {
    if (!isEditing) {
      const text = window.getSelection()?.toString().trim() || '';
      if (text.length > 20 && text.length < 1000) {
        setSelectedText(text);
        setExplanation('');
        explainMutation.mutate(text);
      }
    }
  };

  const handlePrint = () => {
    if (!editableContent) {
      toast.error('Generate a document before printing.');
      return;
    }

    const printContents = document.getElementById('legal-document-print-area')?.innerHTML;
    if (!printContents) {
      toast.error('Printable document area not found.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) {
      toast.error('Unable to open print window.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>${documentTitle || template?.name || 'Legal Document'}</title>
          <style>
            @page {
              size: A4;
              margin: 18mm 16mm;
            }

            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #111827;
              font-family: "Times New Roman", Times, serif;
            }

            .legal-doc-page {
              background: #ffffff;
              color: #111827;
              width: 100%;
              margin: 0 auto;
            }

            .legal-doc-title {
              text-align: center;
              font-size: 22px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              margin-bottom: 12px;
            }

            .legal-doc-subtitle {
              text-align: center;
              font-size: 13px;
              font-style: italic;
              margin-bottom: 20px;
              color: #4b5563;
            }

            .legal-doc-content {
              font-size: 15px;
              line-height: 1.85;
              white-space: pre-wrap;
              word-break: break-word;
            }

            .legal-doc-content h1,
            .legal-doc-content h2,
            .legal-doc-content h3,
            .legal-doc-content h4 {
              text-align: center;
              font-weight: 700;
              margin: 0 0 16px;
            }

            .legal-doc-content p {
              margin: 0 0 12px;
              text-align: justify;
            }

            .legal-doc-content ol,
            .legal-doc-content ul {
              margin: 0 0 12px 22px;
              padding: 0;
            }

            .legal-doc-content li {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleCopy = async () => {
    if (!editableContent) {
      toast.error('Nothing to copy yet.');
      return;
    }

    try {
      await navigator.clipboard.writeText(editableContent);
      toast.success('Document copied to clipboard.');
    } catch {
      toast.error('Failed to copy document.');
    }
  };

  const summaryPreview = useMemo(() => getPreview(summary), [summary]);
  const validationPreview = useMemo(() => getPreview(validationReport), [validationReport]);
  const riskPreview = useMemo(() => getPreview(riskAnalysis?.summary || ''), [riskAnalysis]);

  if (isTemplateLoading) return <div className="text-center p-10">Loading template...</div>;
  if (!template) return <div className="text-center p-10 text-destructive">Template not found.</div>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Legal Drafting Workspace
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{template.description}</p>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-8 xl:grid-cols-[400px_1fr]">
        <Card className="xl:sticky xl:top-24 shadow-sm">
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>Fill in the required information to generate your legal draft.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => generateMutation.mutate(d))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentTitle">Document Title</Label>
                  <div className="flex gap-2">
                    <Input id="documentTitle" value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => titleMutation.mutate(form.getValues())}
                      disabled={titleMutation.isPending}
                    >
                      {titleMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                {template.fields.map((field: any) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    defaultValue=""
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          {field.type === 'textarea' ? <Textarea {...formField} /> : <Input type={field.type} {...formField} />}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <div className="flex flex-wrap gap-3 pt-4">
                  <Button type="submit" disabled={generateMutation.isPending}>
                    {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Document
                  </Button>
                  {editableContent && (
                    <Button type="button" variant="secondary" onClick={handleCopy}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Text
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedText && (
            <Dialog open={!!selectedText} onOpenChange={(open) => !open && setSelectedText('')}>
              <DialogContent className="rounded-2xl border shadow-2xl sm:max-w-2xl">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl">AI Clause Explanation</DialogTitle>
                  <DialogDescription className="border-l-4 pl-4 text-sm text-muted-foreground">
                    &ldquo;{selectedText}&rdquo;
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[65vh] overflow-y-auto pr-1">
                  {explainMutation.isPending && <p className="text-sm text-muted-foreground">Thinking...</p>}
                  {explanation && (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{explanation}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={openAnalysisDialog} onOpenChange={setOpenAnalysisDialog}>
            <DialogContent className="rounded-2xl border shadow-2xl sm:max-w-2xl">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-xl">AI Analysis</DialogTitle>
                <DialogDescription>Executive summary of the generated document.</DialogDescription>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{summary || 'No analysis available yet.'}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openRiskDialog} onOpenChange={setOpenRiskDialog}>
            <DialogContent className="rounded-2xl border shadow-2xl sm:max-w-2xl">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-xl">Risk Analyzer</DialogTitle>
                <DialogDescription>AI review of possible drafting risks and missing protections.</DialogDescription>
              </DialogHeader>
              <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
                {riskAnalysis ? (
                  <>
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${riskStyles[riskAnalysis.risk_level]}`}>
                      <AlertTriangle className="h-4 w-4" />
                      {riskAnalysis.risk_level} Risk
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-4">
                      <p className="text-sm leading-7 text-muted-foreground">{riskAnalysis.summary}</p>
                    </div>

                    {riskAnalysis.issues?.length > 0 && (
                      <div className="rounded-xl border p-4">
                        <h3 className="mb-3 text-sm font-semibold">Key Issues</h3>
                        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                          {riskAnalysis.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {riskAnalysis.suggestions?.length > 0 && (
                      <div className="rounded-xl border p-4">
                        <h3 className="mb-3 text-sm font-semibold">Suggestions</h3>
                        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                          {riskAnalysis.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No risk analysis available yet.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openValidationDialog} onOpenChange={setOpenValidationDialog}>
            <DialogContent className="rounded-2xl border shadow-2xl sm:max-w-2xl">
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-xl">Validation Report</DialogTitle>
                <DialogDescription>Checklist-style review of structural completeness.</DialogDescription>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{validationReport || 'No validation report available yet.'}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="legal-doc-disclaimer no-print flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              This is an AI-assisted legal draft formatted in a formal Indian legal-document style for review and drafting support.
              Please have it reviewed by a qualified legal professional before official execution or filing.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <button
              type="button"
              onClick={() => summary && setOpenAnalysisDialog(true)}
              className="group text-left"
              disabled={!summary}
            >
              <Card className="h-full cursor-pointer border shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg disabled:cursor-default disabled:opacity-70">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI Analysis
                      </CardTitle>
                      <CardDescription className="mt-1">Executive summary of the generated document.</CardDescription>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  {summary ? (
                    <div className="space-y-3">
                      <p className="text-sm leading-7 text-muted-foreground">{summaryPreview}</p>
                      <p className="text-xs font-medium text-primary">Click to view details</p>
                    </div>
                  ) : generateMutation.isPending ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI is analyzing your draft...
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Generate a document to see the AI analysis.</p>
                  )}
                </CardContent>
              </Card>
            </button>

            <button
              type="button"
              onClick={() => riskAnalysis && setOpenRiskDialog(true)}
              className="group text-left"
              disabled={!riskAnalysis}
            >
              <Card className="h-full cursor-pointer border shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg disabled:cursor-default disabled:opacity-70">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        Risk Analyzer
                      </CardTitle>
                      <CardDescription className="mt-1">Potential drafting risks and weak clauses.</CardDescription>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {riskAnalysis ? (
                    <>
                      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${riskStyles[riskAnalysis.risk_level]}`}>
                        <AlertTriangle className="h-4 w-4" />
                        {riskAnalysis.risk_level} Risk
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">{riskPreview}</p>
                      <p className="text-xs font-medium text-primary">Click to view details</p>
                    </>
                  ) : generateMutation.isPending ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI is assessing drafting risk...
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Generate a document to view AI-based drafting risk analysis.</p>
                  )}
                </CardContent>
              </Card>
            </button>

            <button
              type="button"
              onClick={() => validationReport && setOpenValidationDialog(true)}
              className="group text-left"
              disabled={!validationReport}
            >
              <Card className="h-full cursor-pointer border shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg disabled:cursor-default disabled:opacity-70">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        Validation Report
                      </CardTitle>
                      <CardDescription className="mt-1">Checklist-style structural review of the draft.</CardDescription>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  {validationReport ? (
                    <div className="space-y-3">
                      <p className="text-sm leading-7 text-muted-foreground">{validationPreview}</p>
                      <p className="text-xs font-medium text-primary">Click to view details</p>
                    </div>
                  ) : generateMutation.isPending ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI is validating document structure...
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Generate a document to view structural validation feedback.</p>
                  )}
                </CardContent>
              </Card>
            </button>
          </div>

          <Card className="print-area shadow-md">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Generated Document</CardTitle>
                <CardDescription>
                  Review the generated document in a formal print-friendly legal layout.
                </CardDescription>
              </div>

              <div className="no-print flex flex-wrap items-center gap-2">
                {editableContent && (
                  <Button variant={isEditing ? 'default' : 'outline'} size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <Check className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                    {isEditing ? 'Done' : 'Edit'}
                  </Button>
                )}
                {editableContent && (
                  <Button variant="secondary" size="sm" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Save PDF
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {editableContent ? (
                isEditing ? (
                  <Textarea
                    className="h-[32rem] font-mono text-sm"
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                  />
                ) : (
                  <div className="legal-doc-shell">
                    <div id="legal-document-print-area" onMouseUp={handleMouseUp} className="legal-doc-page">
                      <div className="legal-doc-title">{documentTitle || template.name}</div>
                      <div className="legal-doc-subtitle">
                        Draft generated for review in a formal legal-document layout
                      </div>

                      <div className="legal-doc-content">
                        <ReactMarkdown>{editableContent}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
                  Your generated document will appear here in a formal print-ready legal format.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

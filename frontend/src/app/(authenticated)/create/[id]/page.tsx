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
import { Sparkles, Info, Download, Loader2, Pencil, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog';
import { generateProfessionalPdf } from '~/lib/generate-pdf';

export default function CreateDocumentPage() {
  const params = useParams();
  const templateId = params.id as string;
  const form = useForm();

  const [documentTitle, setDocumentTitle] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [explanation, setExplanation] = useState('');

  const { data: template, isLoading: isTemplateLoading } = useQuery<any>({
    queryKey: ['template', templateId],
    queryFn: () => apiClient.get(`/templates/${templateId}`).then(res => {
      setDocumentTitle(res.data.name);
      return res.data;
    }),
    enabled: !!templateId,
  });

  const generateMutation = useMutation({
    mutationFn: (values: any) => apiClient.post('/documents/generate', { template_id: templateId, field_values: values }),
    onSuccess: (res) => {
      setEditableContent(res.data.content);
      setSummary(res.data.summary);
      setIsEditing(false);
      toast.success('Document generated successfully!');
    },
    onError: () => toast.error('Failed to generate document.'),
  });

  const titleMutation = useMutation({
    mutationFn: (values: any) => apiClient.post('/documents/suggest-title', { template_type: template?.name, field_values: values }),
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

  const handleDownloadPdf = () => {
    if (editableContent && documentTitle) {
      try {
        generateProfessionalPdf(documentTitle, form.getValues(), editableContent, template);
        toast.success('PDF download started.');
      } catch (e) {
        console.error(e);
        toast.error('Failed to generate PDF.');
      }
    }
  };

  if (isTemplateLoading) return <div className="text-center p-10">Loading template...</div>;
  if (!template) return <div className="text-center p-10 text-destructive">Template not found.</div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => generateMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentTitle">Document Title</Label>
                <div className="flex gap-2">
                  <Input id="documentTitle" value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} />
                  <Button type="button" variant="outline" size="icon" onClick={() => titleMutation.mutate(form.getValues())} disabled={titleMutation.isPending}>
                    {titleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
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
              <div className="pt-4">
                <Button type="submit" disabled={generateMutation.isPending}>
                  {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Document
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {selectedText && (
          <Dialog open={!!selectedText} onOpenChange={(open) => !open && setSelectedText('')}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Clause Explanation</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground border-l-4 pl-4 my-2">
                  &ldquo;{selectedText}&rdquo;
                </DialogDescription>
              </DialogHeader>
              {explainMutation.isPending && <p>Thinking...</p>}
              {explanation && (
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>The AI&apos;s summary of the generated document.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary && (
              <div className="space-y-2">
                <h3 className="font-semibold">Executive Summary</h3>
                <p className="text-sm text-muted-foreground">{summary}</p>
              </div>
            )}
            {!generateMutation.isSuccess && !generateMutation.isPending && (
              <p className="text-sm text-muted-foreground">Generate a document to see the AI analysis.</p>
            )}
            {generateMutation.isPending && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />AI is analyzing...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Document</CardTitle>
            <div className="flex items-center gap-2">
              {editableContent && (
                <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? <Check className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                  {isEditing ? "Done" : "Edit"}
                </Button>
              )}
              {editableContent && (
                <Button variant="secondary" size="sm" onClick={handleDownloadPdf}>
                  <Download className="mr-2 h-4 w-4" />Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editableContent ? (
              isEditing ? (
                <Textarea className="h-96 text-sm font-mono" value={editableContent} onChange={(e) => setEditableContent(e.target.value)} />
              ) : (
                <div onMouseUp={handleMouseUp} className="prose dark:prose-invert max-w-none p-4 border rounded-md h-96 overflow-y-auto bg-background cursor-text">
                  <ReactMarkdown>{editableContent}</ReactMarkdown>
                </div>
              )
            ) : (
              <div className="text-center text-muted-foreground p-12 border-dashed border-2 rounded-md">
                Your generated document will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { jsPDF } from 'jspdf';

interface FieldValues {
  [key: string]: string | number | undefined;
}

interface TemplateData {
  id?: string;
  name: string;
  fields: Array<{ name: string; label: string; type: string }>;
}

export const generateProfessionalPdf = (
  title: string,
  fieldValues: FieldValues,
  content: string,
  template?: TemplateData
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const normalizedTemplate = (template?.id || template?.name || '').toLowerCase();

  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin) {
      addFooter();
      doc.addPage();
      y = margin;
    }
  };

  const addFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i += 1) {
      doc.setPage(i);
      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  };

  const drawCenteredText = (text: string, size = 12, style: 'normal' | 'bold' | 'italic' = 'normal', spacing = 8) => {
    checkPageBreak(spacing);
    doc.setFont('times', style);
    doc.setFontSize(size);
    doc.text(text, pageWidth / 2, y, { align: 'center' });
    y += spacing;
  };

  const drawLeftParagraph = (text: string, size = 12, style: 'normal' | 'bold' | 'italic' = 'normal', spacing = 7) => {
    doc.setFont('times', style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(spacing);
      doc.text(line, margin, y);
      y += spacing;
    });
  };

  const drawSectionGap = (gap = 6) => {
    y += gap;
  };

  const cleanMarkdown = (input: string) =>
    input
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^#+\s?/gm, '')
      .trim();

  const partyOneKeys = ['landlord_name', 'disclosing_party_name', 'party1_name', 'employer_name', 'deponent_name'];
  const partyTwoKeys = ['tenant_name', 'receiving_party_name', 'party2_name', 'employee_name'];
  const addressOneKeys = ['property_address', 'address', 'deponent_address', 'party1_address', 'landlord_address'];
  const addressTwoKeys = ['tenant_address', 'receiving_party_address', 'party2_address', 'employee_address'];

  const p1Key = partyOneKeys.find((k) => fieldValues[k]);
  const p2Key = partyTwoKeys.find((k) => fieldValues[k]);
  const addr1Key = addressOneKeys.find((k) => fieldValues[k]);
  const addr2Key = addressTwoKeys.find((k) => fieldValues[k]);

  const p1 = p1Key ? String(fieldValues[p1Key]) : 'Party A';
  const p2 = p2Key ? String(fieldValues[p2Key]) : 'Party B';
  const addr1 = addr1Key ? String(fieldValues[addr1Key]) : 'Address not provided';
  const addr2 = addr2Key ? String(fieldValues[addr2Key]) : 'Address not provided';

  const now = new Date();
  const dateLong = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Header
  drawCenteredText(title.toUpperCase(), 16, 'bold', 10);
  drawCenteredText(`Draft generated on ${dateLong}`, 10, 'italic', 10);
  drawSectionGap(4);

  // Template-specific opening
  if (normalizedTemplate.includes('affidavit')) {
    drawCenteredText('AFFIDAVIT', 14, 'bold', 10);
    drawLeftParagraph(`I, ${p1}, residing at ${addr1}, do hereby solemnly affirm and state as under:`, 12, 'normal', 7);
    drawSectionGap(4);
  } else {
    drawLeftParagraph(`This document is made on ${dateLong}.`, 12, 'normal', 7);
    drawSectionGap(2);
    drawLeftParagraph('BETWEEN:', 12, 'bold', 7);
    drawLeftParagraph(`${p1.toUpperCase()}, residing at ${addr1}.`, 11, 'normal', 7);
    drawLeftParagraph('(Hereinafter referred to as the "FIRST PARTY / PARTY A")', 10, 'italic', 7);
    drawSectionGap(2);
    drawLeftParagraph('AND', 12, 'bold', 7);
    drawLeftParagraph(`${p2.toUpperCase()}, residing at ${addr2}.`, 11, 'normal', 7);
    drawLeftParagraph('(Hereinafter referred to as the "SECOND PARTY / PARTY B")', 10, 'italic', 7);
    drawSectionGap(4);
  }

  // Body
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setLineHeightFactor(1.6);

  const cleanedContent = cleanMarkdown(content);
  const paragraphs = cleanedContent
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  paragraphs.forEach((paragraph) => {
    const lines = doc.splitTextToSize(paragraph, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(7);
      doc.text(line, margin, y, { align: 'justify', maxWidth: contentWidth });
      y += 7;
    });
    y += 3;
  });

  drawSectionGap(8);

  // Closing/signatures
  if (normalizedTemplate.includes('affidavit')) {
    drawLeftParagraph('VERIFICATION', 12, 'bold', 7);
    drawLeftParagraph(
      'I, the above-named deponent, do hereby verify that the contents of this affidavit are true and correct to the best of my knowledge and belief, and that nothing material has been concealed therefrom.',
      11,
      'normal',
      7
    );
    drawSectionGap(8);
    drawLeftParagraph(`Verified on: ${dateLong}`, 11, 'normal', 7);
    drawSectionGap(10);

    checkPageBreak(30);
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.text('________________________', pageWidth - margin - 55, y);
    y += 6;
    doc.text(`Signature of ${p1}`, pageWidth - margin - 45, y);
  } else {
    drawCenteredText('IN WITNESS WHEREOF, the parties hereto have executed this document on the date mentioned above.', 11, 'bold', 10);
    drawSectionGap(10);

    checkPageBreak(40);
    const leftX = margin;
    const rightX = pageWidth / 2 + 10;
    const sigY = y;

    doc.setFont('times', 'normal');
    doc.setFontSize(11);

    doc.text('________________________', leftX, sigY);
    doc.text('________________________', rightX, sigY);

    doc.text(`Signature of ${p1}`, leftX, sigY + 8);
    doc.text(`Signature of ${p2}`, rightX, sigY + 8);

    y = sigY + 18;

    doc.text('Witness 1: ____________________', leftX, y);
    doc.text('Witness 2: ____________________', rightX, y);
  }

  addFooter();
  doc.save(`${title.replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`);
};

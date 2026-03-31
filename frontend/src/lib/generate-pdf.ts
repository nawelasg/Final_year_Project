import { jsPDF } from 'jspdf';

interface FieldValues {
  [key: string]: string | number | undefined;
}

interface TemplateData {
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
  const margin = 25;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("times", "normal");

  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // 1. Document Header
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text(title.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 15;

  // 2. Effective Date
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { day: 'numeric' });
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const year = now.toLocaleDateString('en-US', { year: '2-digit' });
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  const dateText = `THIS AGREEMENT is made and entered into on this ${day} day of ${month}, 20${year}`;
  doc.text(dateText, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.text('(hereinafter referred to as the "Effective Date")', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // 3. Parties Section
  const partyOneKeys = ["landlord_name", "disclosing_party_name", "party1_name", "employer_name", "deponent_name"];
  const partyTwoKeys = ["tenant_name", "receiving_party_name", "party2_name", "employee_name"];
  const addressOneKeys = ["property_address", "address", "deponent_address", "party1_address", "landlord_address"];
  const addressTwoKeys = ["tenant_address", "receiving_party_address", "party2_address", "employee_address"];

  const p1Key = partyOneKeys.find(k => fieldValues[k]);
  const p2Key = partyTwoKeys.find(k => fieldValues[k]);
  const addr1Key = addressOneKeys.find(k => fieldValues[k]);
  const addr2Key = addressTwoKeys.find(k => fieldValues[k]);

  const p1 = p1Key ? String(fieldValues[p1Key]) : "Party A";
  const p2 = p2Key ? String(fieldValues[p2Key]) : "Party B";
  const addr1 = addr1Key ? String(fieldValues[addr1Key]) : "Address not provided";
  const addr2 = addr2Key ? String(fieldValues[addr2Key]) : "Address not provided";

  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("BETWEEN:", margin, y);
  y += 8;

  doc.setFont("times", "normal");
  doc.setFontSize(11);

  // Party A
  doc.setFont("times", "bold");
  doc.text(p1.toUpperCase(), margin, y);
  doc.setFont("times", "normal");
  doc.text(", residing at ", margin + doc.getTextWidth(p1.toUpperCase()) + 1, y);
  y += 6;
  const p1AddressLines = doc.splitTextToSize(addr1, contentWidth);
  doc.text(p1AddressLines, margin, y);
  y += (p1AddressLines.length * 6) + 4;
  doc.setFont("times", 'italic');
  doc.text('(Hereinafter referred to as the "FIRST PARTY / PARTY A")', margin, y);
  y += 10;

  doc.setFont("times", "bold");
  doc.text("AND", margin, y);
  y += 10;

  // Party B
  doc.setFont("times", "bold");
  doc.text(p2.toUpperCase(), margin, y);
  doc.setFont("times", "normal");
  doc.text(", residing at ", margin + doc.getTextWidth(p2.toUpperCase()) + 1, y);
  y += 6;
  const p2AddressLines = doc.splitTextToSize(addr2, contentWidth);
  doc.text(p2AddressLines, margin, y);
  y += (p2AddressLines.length * 6) + 4;
  doc.setFont("times", 'italic');
  doc.text('(Hereinafter referred to as the "SECOND PARTY / PARTY B")', margin, y);
  y += 15;

  // 4. Main Content
  doc.setFont("times", 'normal');
  doc.setFontSize(12);
  doc.setLineHeightFactor(1.5);

  const cleanedContent = content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  const lines = doc.splitTextToSize(cleanedContent, contentWidth);
  lines.forEach((line: string) => {
    checkPageBreak(8);
    doc.text(line, margin, y, { align: 'justify' });
    y += 8;
  });

  // 5. Signatures
  checkPageBreak(80);
  y += 20;
  doc.setFont("times", 'bold');
  doc.text("IN WITNESS WHEREOF, the parties have executed this Agreement.", pageWidth / 2, y, { align: 'center' });
  y += 30;

  const colWidth = contentWidth / 2 - 10;
  const col2X = margin + colWidth + 20;
  const ySigStart = y;

  doc.setFontSize(10);
  doc.text("________________________", margin, y);
  y += 6;
  doc.text(`(Signature of ${p1})`, margin, y);

  y = ySigStart;
  doc.text("________________________", col2X, y);
  y += 6;
  doc.text(`(Signature of ${p2})`, col2X, y);

  doc.save(`${title.replace(/ /g, '_')}.pdf`);
};

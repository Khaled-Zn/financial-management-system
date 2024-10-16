import PDFDocument from 'pdfkit';
import { Invoice } from '../entities/invoice.entity';
import { join } from 'path';
import { company } from '@prisma/client';

export default function createInvoice(
  invoice: Omit<Invoice, 'project'> & {
    createdAt: Date;
    company: Pick<company, 'name'>;
  },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.on('error', reject);

    generateHeader(doc, invoice.company);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    doc.end();
  });
}

function generateHeader(
  doc: PDFKit.PDFDocument,
  company: Pick<company, 'name'>,
): void {
  doc
    .image(join(process.cwd(), '/uploads/logo.png'), 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(20)
    .text(company.name, 110, 57)
    .fontSize(10)
    .text(company.name, 200, 50, { align: 'right' })
    // .text('123 Main Street', 200, 65, { align: 'right' })
    // .text('New York, NY, 10025', 200, 80, { align: 'right' })
    .moveDown();
}

function generateCustomerInformation(
  doc: PDFKit.PDFDocument,
  invoice: Omit<Invoice, 'project'> & { createdAt: Date },
): void {
  doc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text('Invoice Number:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.serialNumber.toString(), 150, customerInformationTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInformationTop + 15)
    .text(invoice.createdAt.toISOString(), 150, customerInformationTop + 15)
    .text('Due Date:', 50, customerInformationTop + 30)
    .text(invoice.dueDate.toISOString(), 150, customerInformationTop + 30)
    .text('Invoice Status:', 50, customerInformationTop + 45)
    .text(invoice.status, 150, customerInformationTop + 45)

    .font('Helvetica-Bold')
    .text(invoice.client.fullName, 300, customerInformationTop)
    .font('Helvetica')
    .text(invoice.client.email, 300, customerInformationTop + 15)
    .text(invoice.client.phone, 300, customerInformationTop + 30)
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(
  doc: PDFKit.PDFDocument,
  invoice: Omit<Invoice, 'project'> & { createdAt: Date },
): void {
  const invoiceTableTop = 330;
  let i: number;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Item',
    'Charging Price ',
    'Quantity',
    'Line Total',
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.itemName,
      item.chargingPrice.toFixed(2),
      item.quantity.toString(),
      (item.chargingPrice * item.quantity).toFixed(2),
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    subtotalPosition,
    '',
    'Total',
    '',
    invoice.totalItemsPrice.toFixed(2),
  );

  doc.font('Helvetica');
}

function generateFooter(doc: PDFKit.PDFDocument): void {
  doc
    .fontSize(10)
    .text(
      'Payment is due within 15 days. Thank you for your business.',
      50,
      780,
      { align: 'center', width: 500 },
    );
}

function generateTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  item: string,
  chargingPrice: string,
  quantity: string,
  lineTotal: string,
): void {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(chargingPrice, 280, y, { width: 90, align: 'right' })
    .text(quantity, 370, y, { width: 90, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' });
}

function generateHr(doc: PDFKit.PDFDocument, y: number): void {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

import { InvoiceItem, InvoiceStatus, InvoiceType } from '@prisma/client';
import { instanceToPlain } from 'class-transformer';

type Contact = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  deleted: boolean;
};

type Project = {
  id: number;
  title: string;
  client: Contact;
  startDate: Date;
  endDate: Date;
};

export type Invoice = {
  id: number;
  serialNumber: string;
  dueDate: Date;
  note: string;
  type: InvoiceType;
  status: InvoiceStatus;
  totalItemsPrice: number;
  client: Contact;
  project: Project;
  items: InvoiceItem[];
};

export class InvoiceEntity {
  id: number;
  serialNumber: string;
  dueDate: Date;
  note: string;
  type: InvoiceType;
  status: InvoiceStatus;
  totalItemsPrice: number;
  items: InvoiceItem[];
  client: Contact;
  project: Project;

  constructor(invoice: Invoice) {
    this.id = invoice.id;
    this.serialNumber = invoice.serialNumber;
    this.dueDate = invoice.dueDate;
    this.note = invoice.note;
    this.type = invoice.type;
    this.status = invoice.status;
    this.totalItemsPrice = this.totalItemsPrice;
    this.items = invoice.items;
    this.client = invoice.client;
    this.project = invoice.project;
  }

  static createInstance(payload: Invoice): InvoiceEntity;
  static createInstance(payload: Invoice[]): InvoiceEntity[];
  static createInstance(payload: Invoice | Invoice[]) {
    if (Array.isArray(payload)) {
      return payload.map((inventory) => instanceToPlain(new this(inventory)));
    } else {
      if (!payload) return {};
      return instanceToPlain(new this(payload));
    }
  }
}

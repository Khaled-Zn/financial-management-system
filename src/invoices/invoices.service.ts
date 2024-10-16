import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { sumBy } from 'lodash';
import { MovementsService } from 'src/movements/movement.service';
import { FilterDto } from './dto/filter.dto';
import { Prisma } from '@prisma/client';
import createInvoice from './utils/convert-to-pdf';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly movementsService: MovementsService,
  ) {}
  async create(createInvoiceDto: CreateInvoiceDto, companyId: number) {
    const totalItemsPrice = sumBy(createInvoiceDto.items, function (item) {
      return item.chargingPrice * item.quantity;
    });
    const connectProject = {
      project: { connect: { id: createInvoiceDto.projectId } },
    };
    const connectInvoiceMedia = {
      InvoicesMedia: {
        create: createInvoiceDto.attachments?.map((id) => ({
          mediaId: id,
        })),
      },
    };
    const invoice = await this.prisma.invoice.create({
      data: {
        dueDate: createInvoiceDto.dueDate,
        serialNumber: createInvoiceDto.serialNumber,
        ...(createInvoiceDto.projectId && connectProject),
        ...(createInvoiceDto.attachments?.length && connectInvoiceMedia),
        client: {
          connect: { id: createInvoiceDto.clientId },
        },
        note: createInvoiceDto.note,
        type: createInvoiceDto.type,
        totalItemsPrice: totalItemsPrice,
        items: {
          create: createInvoiceDto.items,
        },
        company: { connect: { id: companyId } },
      },
      include: {
        items: true,
        client: true,
        project: {
          select: {
            title: true,
            client: true,
            startDate: true,
            endDate: true,
            id: true,
          },
        },
        // InvoicesMedia: {
        //   select: {
        //     media: true,
        //   },
        // },
      },
    });
    await this.movementsService.financialMovements(
      {
        amount: totalItemsPrice,
        status: 'PENDING',
        type: createInvoiceDto.type,
        projectId: createInvoiceDto.projectId ?? null,
      },
      companyId,
    );
    return invoice;
  }

  async findAll(filterhDto: FilterDto, companyId: number) {
    const query: Prisma.InvoiceWhereInput = { companyId };
    if (filterhDto?.project) {
      query.projectId = filterhDto.project;
    }
    const invoices = await this.prisma.invoice.findMany({
      where: query,
      include: {
        items: true,
        client: true,
        project: {
          select: {
            title: true,
            client: true,
            startDate: true,
            endDate: true,
            id: true,
          },
        },
      },
    });
    return invoices;
  }

  async findOne(id: number, companyId: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: id,
        companyId,
      },
      include: {
        items: true,
        client: true,
        project: {
          select: {
            title: true,
            client: true,
            startDate: true,
            endDate: true,
            id: true,
          },
        },
      },
    });
    return invoice;
  }

  async convertInvoiceToPdf(id: number, companyId: number) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: id, companyId },
      include: {
        client: true,
        items: true,
        company: { select: { name: true } },
      },
    });
    if (!invoice) throw new NotFoundException('there is no invoice');

    return await createInvoice(invoice);
  }
}

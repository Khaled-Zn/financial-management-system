import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';
import { MovementsService } from 'src/movements/movement.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly movementsService: MovementsService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, companyId: number) {
    const invoice = await this.prisma.invoice.update({
      where: {
        id: createPaymentDto.invoiceId,
        companyId,
      },
      data: {
        status: InvoiceStatus.PAID,
      },
    });
    await this.movementsService.financialMovements(
      {
        amount: invoice.totalItemsPrice,
        status: 'PAID',

        type: invoice.type,
        projectId: invoice.projectId ?? null,
      },
      companyId,
    );
    return await this.prisma.payment.create({
      data: {
        company: { connect: { id: companyId } },
        paymentDate: createPaymentDto.paymentDate,
        note: createPaymentDto.note,
        invoice: { connect: { id: createPaymentDto.invoiceId } },
      },
      include: {
        invoice: {
          select: { id: true, serialNumber: true, totalItemsPrice: true },
        },
      },
    });
  }

  async findAll(companyId: number) {
    return await this.prisma.payment.findMany({
      where: { companyId },
      include: {
        invoice: {
          select: {
            id: true,
            serialNumber: true,
            totalItemsPrice: true,
            type: true,
          },
        },
      },
    });
  }
}

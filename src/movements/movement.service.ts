import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InvoiceStatus, InvoiceType, Prisma } from '@prisma/client';
type FinancialMovement = {
  amount: number;
  status: InvoiceStatus;
  type: InvoiceType;
  projectId?: number;
};

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  /**
   *
   * Anyone review this code: It's a worst way to write this type of code casue it's dirty and I recommend
   * to use a pattern like the factory pattern, This way you do not violate open/closed principle.
   */
  async financialMovements(movment: FinancialMovement, companyId: number) {
    const financialMovement: Pick<
      Prisma.ProjectUncheckedUpdateInput,
      'accountsPayable' | 'accountsReceivable' | 'actualCost' | 'actualPrice'
    > = {};
    switch (movment.status) {
      case InvoiceStatus.PAID: {
        switch (movment.type) {
          case InvoiceType.RECEIVED:
            financialMovement.actualCost = { increment: movment.amount };
            financialMovement.accountsPayable = { decrement: movment.amount };
            break;
          default:
            financialMovement.actualPrice = { increment: movment.amount };
            financialMovement.accountsReceivable = {
              decrement: movment.amount,
            };
            break;
        }
        break;
      }

      default: {
        switch (movment.type) {
          case InvoiceType.RECEIVED:
            financialMovement.accountsPayable = { increment: movment.amount };
            break;
          default:
            financialMovement.accountsReceivable = {
              increment: movment.amount,
            };
            break;
        }
        break;
      }
    }
    if (movment.projectId) {
      await this.prisma.project.update({
        where: { id: movment.projectId, companyId },
        data: financialMovement,
      });
    }
    await this.prisma.company.update({
      where: {
        id: companyId,
      },
      data: financialMovement,
    });
  }
}

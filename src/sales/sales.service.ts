import { EntityType } from '@prisma/client';
import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto, companyId: number) {
    let price = 0;
    let totalQuantity = 0;

    for (const spec of createSaleDto.specifications) {
      const saleQuantity = spec.quantity;

      const inventoryItem = await this.prisma.inventoryPosItems.findFirst({
        where: {
          inventoryOrPosId: createSaleDto.posId,
          itemId: createSaleDto.itemId,
          quantity: { gt: 0 },
          specificationId: spec.sizeSpecificationsId,
        },
      });
      console.log(inventoryItem);

      if (!inventoryItem) {
        throw new HttpException('Not Found', 404);
      }

      if (inventoryItem.quantity < saleQuantity) {
        throw new BadRequestException(
          `Quantity not available for specification ID: ${spec.sizeSpecificationsId}`,
        );
      }
    }

    for (const spec of createSaleDto.specifications) {
      const saleQuantity = spec.quantity;

      // Decrease quantity in inventoryPosItems
      const inventoryItem = await this.prisma.inventoryPosItems.findFirst({
        where: {
          inventoryOrPosId: createSaleDto.posId,
          itemId: createSaleDto.itemId,
          quantity: { gt: 0 },
          specificationId: spec.sizeSpecificationsId,
        },
      });

      inventoryItem.quantity -= saleQuantity;
      await this.prisma.inventoryPosItems.update({
        where: { id: inventoryItem.id },
        data: { quantity: inventoryItem.quantity },
      });

      totalQuantity += saleQuantity;

      // Calculate price
      price += inventoryItem.price * saleQuantity;
    }

    // Decrease total quantity in inventoryAndPos
    const totalQuantityRecord = await this.prisma.inventoryAndPos.findUnique({
      where: { id: createSaleDto.posId, companyId, type: EntityType.POS },
    });

    if (!totalQuantityRecord) {
      throw new HttpException('POS Not Found', 404);
    }

    if (totalQuantityRecord.totalQuantity < totalQuantity) {
      throw new BadRequestException('Quantity not available');
    }

    totalQuantityRecord.totalQuantity -= totalQuantity;

    await this.prisma.inventoryAndPos.update({
      where: { id: totalQuantityRecord.id },
      data: { totalQuantity: totalQuantityRecord.totalQuantity },
    });

    return await this.prisma.sale.create({
      data: {
        price: price,
        inventoryOrPos: { connect: { id: createSaleDto.posId } },
        item: { connect: { id: createSaleDto.itemId } },
        company: { connect: { id: companyId } },
        specifications: {
          create: createSaleDto.specifications.map((spec) => ({
            specificationId: spec.sizeSpecificationsId,
            quantity: spec.quantity,
          })),
        },
      },
      include: {
        inventoryOrPos: {
          select: {
            name: true,
            id: true,
            address: true,
          },
        },
        item: {
          select: {
            id: true,
            type: true,
            name: true,
            description: true,
            cost: true,
          },
        },
        specifications: {
          select: {
            saleId: true,
            specificationId: true,
            quantity: true,
            createdAt: true,
            Specification: { select: { colorName: true, size: true } },
          },
        },
      },
    });
  }

  async findAll(companyId: number) {
    return await this.prisma.sale.findMany({
      where: { companyId },
      include: {
        inventoryOrPos: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        item: {
          select: {
            id: true,
            type: true,
            name: true,
            description: true,
            cost: true,
          },
        },
        specifications: {
          select: {
            saleId: true,
            specificationId: true,
            quantity: true,
            createdAt: true,
            Specification: { select: { colorName: true, size: true } },
          },
        },
      },
    });
  }

  async findOne(id: number, companyId: number) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: id, companyId },
      include: {
        inventoryOrPos: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        item: {
          select: {
            id: true,
            type: true,
            name: true,
            description: true,
            cost: true,
          },
        },
        specifications: {
          select: {
            saleId: true,
            specificationId: true,
            quantity: true,
            createdAt: true,
            Specification: { select: { colorName: true, size: true } },
          },
        },
      },
    });
    return sale;
  }
}

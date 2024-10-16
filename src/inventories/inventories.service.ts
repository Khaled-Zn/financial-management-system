import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityType, Prisma } from '@prisma/client';
import { AddItemToInventoryDto } from './dto/add-item-to-inventory.dto';
import { sumBy } from 'lodash';
import { RequestInventoryItemDto } from './dto/request-item.dto';

@Injectable()
export class InventoriesService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createInventoryDto: CreateInventoryDto, companyId: number) {
    const inventory = await this.prismaService.inventoryAndPos.create({
      data: {
        ...createInventoryDto,
        company: { connect: { id: companyId } },
        type: EntityType.INVENTORY,
      },
      select: { address: true, id: true, name: true },
    });
    return inventory;
  }

  async findAll(companyId: number) {
    const inventories = await this.prismaService.inventoryAndPos.findMany({
      where: { type: EntityType.INVENTORY, companyId, deleted: false },
      select: { address: true, id: true, name: true },
    });
    return inventories;
  }

  async findOne(id: number, companyId: number) {
    const inventory = await this.prismaService.inventoryAndPos.findFirst({
      where: { id: id, companyId, type: EntityType.INVENTORY },
      select: {
        address: true,
        id: true,
        name: true,
        InventoryPosItems: {
          select: {
            quantity: true,
            item: true,
            specification: true,
          },
        },
      },
    });
    return inventory;
  }

  async update(
    id: number,
    updateInventoryDto: UpdateInventoryDto,
    companyId: number,
  ) {
    const inventory = await this.prismaService.inventoryAndPos.update({
      where: { id: id, companyId, type: EntityType.INVENTORY },
      data: { ...updateInventoryDto },
    });
    return inventory;
  }

  async remove(id: number, companyId: number) {
    await this.prismaService.$transaction([
      this.prismaService.inventoriesBelongToPos.deleteMany({
        where: {
          inventoryId: id,
        },
      }),
      this.prismaService.inventoryAndPos.update({
        where: { id: id, companyId, type: EntityType.INVENTORY },
        data: { deleted: true },
      }),
    ]);
  }

  async addItem(
    id: number,
    addItemToInventoryDto: AddItemToInventoryDto,
    companyId: number,
  ) {
    const totalQuantity = sumBy(
      addItemToInventoryDto.specifications,
      'quantity',
    );
    const sizesIds = addItemToInventoryDto.specifications.map(
      (specification) => specification.sizeSpecificationsId,
    );
    const existingIds = await this.checkIfThereSizesAlreadyExist(
      id,
      addItemToInventoryDto.itemId,
      sizesIds,
    );
    await this.prismaService.$transaction(async (tx) => {
      if (existingIds.length) {
        for (const id of existingIds) {
          const specification = addItemToInventoryDto.specifications.find(
            (specification) => specification.sizeSpecificationsId === id,
          );
          await tx.inventoryPosItems.update({
            where: {
              id: id,
            },
            data: {
              quantity: { increment: specification.quantity },
            },
          });
        }
      }
      const filterdSpecifications = addItemToInventoryDto.specifications.filter(
        (specification) =>
          !existingIds.includes(specification.sizeSpecificationsId),
      );
      if (filterdSpecifications.length || !existingIds.length) {
        if (filterdSpecifications.length) {
          addItemToInventoryDto.specifications = filterdSpecifications;
        }
        const specifications = this.linkSpecificationsWithItsRelations(
          id,
          addItemToInventoryDto,
        );
        await tx.inventoryPosItems.createMany({
          data: specifications,
        });
      }
      await tx.inventoryAndPos.update({
        where: { id, companyId },
        data: { totalQuantity: { increment: totalQuantity } },
      });
    });
  }

  async inventoriesOfPos(postId: number, companyId: number) {
    const inventoriesBelongToPos =
      await this.prismaService.inventoriesBelongToPos.findMany({
        where: {
          posId: postId,
        },
        select: {
          inventoryId: true,
        },
      });
    const inventoriesIds = inventoriesBelongToPos.map(
      (inventoryBelongToPos) => inventoryBelongToPos.inventoryId,
    );
    const inventories = await this.prismaService.inventoryAndPos.findMany({
      where: { id: { in: inventoriesIds }, companyId },
      select: {
        address: true,
        id: true,
        name: true,
        InventoryPosItems: {
          select: {
            quantity: true,
            item: true,
            specification: true,
          },
        },
      },
    });
    return inventories;
  }

  private async checkIfThereSizesAlreadyExist(
    inventoryId: number,
    itemId: number,
    sizesIds: number[],
  ) {
    return (
      await this.prismaService.inventoryPosItems.findMany({
        where: {
          inventoryOrPosId: inventoryId,
          itemId: itemId,
          specificationId: { in: sizesIds },
        },
        select: {
          id: true,
        },
      })
    ).map((size) => size.id);
  }

  private linkSpecificationsWithItsRelations(
    id: number,
    addItemToInventoryDto: AddItemToInventoryDto,
  ): Prisma.InventoryPosItemsUncheckedCreateInput[] {
    return addItemToInventoryDto.specifications.map((specification) => ({
      quantity: specification.quantity,
      inventoryOrPosId: id,
      itemId: addItemToInventoryDto.itemId,
      specificationId: specification.sizeSpecificationsId,
    }));
  }

  async requestItem(
    requestItemDto: RequestInventoryItemDto,
    id: number,
    companyId: number,
  ) {
    const to = await this.prismaService.inventoryAndPos.findUnique({
      where: {
        id: id,
        deleted: false,
        type: EntityType.INVENTORY,
        companyId,
      },
      include: {
        InventoryPosItems: true,
      },
    });
    if (!to)
      throw new NotFoundException(
        'Pos Or Inventory You Are Sending To Is Not Found',
      );
    const from = await this.prismaService.inventoryAndPos.findUnique({
      where: {
        id: requestItemDto.inventoryId,
        type: EntityType.INVENTORY,
        deleted: false,
        companyId,
      },
      include: {
        InventoryPosItems: true,
        inventoryBelong: {
          where: { pos: { deleted: false } },
          include: { pos: { include: { InventoryPosItems: true } } },
        },
      },
    });
    if (!from)
      throw new NotFoundException(
        'Pos Or Inventory You Are Requesting From Is Not Found',
      );
    // if (from.type == EntityType.INVENTORY) {
    //   const posId = from.inventoryBelong.findIndex((inventoryBelong) => {
    //     return inventoryBelong.pos.id == id && !inventoryBelong.pos.deleted;
    //   });
    //   if (posId == -1)
    //     throw new NotFoundException(
    //       'Pos Does Not Belong To Inventory Or Not Found',
    //     );
    // }
    let flag: boolean;
    const idLest: number[] = [];
    const allSpecificationsExist = requestItemDto.specifications.findIndex(
      (specification) => {
        if (idLest.includes(specification.sizeSpecificationsId)) {
          throw new BadRequestException('Duplicate Specification ID');
        }
        idLest.push(specification.sizeSpecificationsId);
        return !from.InventoryPosItems.some((inventoryItem) => {
          flag =
            inventoryItem.itemId == requestItemDto.itemId &&
            inventoryItem.specificationId ==
              specification.sizeSpecificationsId &&
            inventoryItem.quantity >= specification.quantity;
          if (flag) {
            specification['fromItemId'] = inventoryItem.id;
            specification['fromItemQuantity'] = inventoryItem.quantity;
          }
          return flag;
        });
      },
    );
    // the condition is not equal because the findindex is reversed
    if (allSpecificationsExist != -1)
      throw new NotFoundException(
        'Item Specification ID ' +
          requestItemDto.specifications[allSpecificationsExist]
            .sizeSpecificationsId +
          ' Or Item ID ' +
          requestItemDto.itemId +
          ' Not Found In ' +
          from.type +
          ' Or Not Enough Quantity',
      );
    let req = null;
    await this.prismaService.$transaction(async (tx) => {
      req = await tx.request.create({
        data: {
          item: { connect: { id: requestItemDto.itemId } },
          from: {
            connect: { id: requestItemDto.inventoryId },
          },
          to: {
            connect: { id: id },
          },
          company: { connect: { id: companyId } },
        },
      });
      for (const specification of requestItemDto.specifications) {
        await tx.inventoryPosItemRequest.create({
          data: {
            quantity: specification.quantity,
            item: { connect: { id: requestItemDto.itemId } },
            request: { connect: { id: req.id } },
            specification: {
              connect: { id: specification.sizeSpecificationsId },
            },
          },
        });
      }
    });
    await this.acceptItemRequest(from.id, req.id);
  }

  async findAllRequestItem(id: number, companyId: number) {
    const request = await this.prismaService.request.findMany({
      where: {
        deleted: false,
        OR: [{ fromId: id }, { toId: id }],
        companyId,
        from: { type: EntityType.INVENTORY, deleted: false },
      },
      select: {
        id: true,
        from: { select: { id: true, name: true, address: true } },
        to: { select: { id: true, name: true, address: true } },
        createdAt: true,
        inventoryPosItemRequest: {
          select: { specification: true, quantity: true, item: true },
        },
      },
    });
    return request;
  }

  async acceptItemRequest(inventoryId: number, requestId: number) {
    const request = await this.prismaService.request.findUnique({
      where: { id: requestId, fromId: inventoryId, deleted: false },
      include: {
        inventoryPosItemRequest: { include: { specification: true } },
        to: { include: { InventoryPosItems: true } },
      },
    });
    const from = await this.prismaService.inventoryAndPos.findUnique({
      where: {
        id: inventoryId,
        deleted: false,
        type: EntityType.INVENTORY,
      },
      include: {
        InventoryPosItems: true,
        inventoryBelong: {
          where: { pos: { deleted: false } },
          include: { pos: { include: { InventoryPosItems: true } } },
        },
      },
    });
    if (!from)
      throw new NotFoundException(
        'Pos Or Inventory You Are Requesting From Is Not Found',
      );
    const to = await this.prismaService.inventoryAndPos.findUnique({
      where: {
        id: request.toId,
        deleted: false,
      },
      include: {
        InventoryPosItems: true,
      },
    });
    if (!to)
      throw new NotFoundException(
        'Pos Or Inventory You Are Sennding To Is Not Found',
      );
    let flag: boolean;
    const idLest: number[] = [];
    const allSpecificationsExist = request.inventoryPosItemRequest.findIndex(
      (tempRequest) => {
        if (idLest.includes(tempRequest.specificationId)) {
          throw new BadRequestException('Duplicate Specification ID');
        }
        idLest.push(tempRequest.specificationId);
        return !from.InventoryPosItems.some((inventoryItem) => {
          flag =
            inventoryItem.itemId == request.itemId &&
            inventoryItem.specificationId == tempRequest.specificationId &&
            inventoryItem.quantity >= tempRequest.quantity;
          if (flag) {
            tempRequest['fromItemId'] = inventoryItem.id;
            tempRequest['fromItemQuantity'] = inventoryItem.quantity;
          }
          return flag;
        });
      },
    );
    if (!allSpecificationsExist)
      throw new NotFoundException(
        'Item Specification ID ' +
          request.inventoryPosItemRequest[allSpecificationsExist]
            .specificationId +
          ' Or Item ID ' +
          request.itemId +
          ' Not Found In ' +
          from.type +
          ' Or Not Enough Quantity',
      );

    await this.prismaService.$transaction(async (tx) => {
      let toItemId: number;
      for (const specification of request.inventoryPosItemRequest) {
        toItemId = request.to.InventoryPosItems.findIndex(
          (toItem) =>
            toItem.itemId == request.itemId &&
            toItem.specificationId == specification.id,
        );
        if (toItemId == -1) {
          //create posItem and increase quantity
          await tx.inventoryPosItems.create({
            data: {
              quantity: specification.quantity,
              inventoryOrPos: {
                connect: { id: request.toId },
              },
              item: { connect: { id: request.itemId } },
              specification: {
                connect: { id: specification.specificationId },
              },
            },
          });
        } else {
          //increase quantity
          await tx.inventoryPosItems.update({
            where: { id: request.to.InventoryPosItems[toItemId].id },
            data: {
              quantity:
                request.to.InventoryPosItems[toItemId].quantity +
                specification.quantity,
              price: specification.price,
            },
          });
        }
        await tx.inventoryPosItems.update({
          where: { id: specification['fromItemId'] },
          data: {
            quantity:
              specification['fromItemQuantity'] - specification.quantity,
          },
        });
        from.totalQuantity = from.totalQuantity - specification.quantity;
        to.totalQuantity = to.totalQuantity + specification.quantity;
      }
      await tx.inventoryAndPos.update({
        where: { id: from.id, type: EntityType.INVENTORY },
        data: { totalQuantity: from.totalQuantity },
      });
      await tx.inventoryAndPos.update({
        where: { id: to.id, type: to.type },
        data: { totalQuantity: to.totalQuantity },
      });
    });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityType } from '@prisma/client';
import {
  UpdatePosDto,
  CreatePosDto,
  AddItemToPosDto,
  RequestItemDto,
} from './dto';

@Injectable()
export class PosService {
  constructor(private prisma: PrismaService) {}
  checkForDuplicates(array: number[]) {
    return new Set(array).size !== array.length;
  }

  private async checkIfInventoriesExist(
    inventoriesIds: number[],
    companyId: number,
  ) {
    const inventoriesCount: number[] = await Promise.all(
      inventoriesIds.map(async (id) => {
        return await this.prisma.inventoryAndPos.count({
          where: {
            id: id,
            companyId,
            deleted: false,
            type: EntityType.INVENTORY,
          },
        });
      }),
    );
    const allInventoriesExist: number = inventoriesCount.findIndex(
      (count) => count == 0,
    );
    if (allInventoriesExist != -1) {
      throw new NotFoundException(
        'inventory ID ' + inventoriesIds[allInventoriesExist] + ' Not Found',
      );
    }
  }
  async create(createPosDto: CreatePosDto, companyId: number) {
    if (this.checkForDuplicates(createPosDto.inventoriesIds)) {
      throw new BadRequestException('Duplicate Inventory ID');
    }

    if (createPosDto.inventoriesIds.length) {
      await this.checkIfInventoriesExist(
        createPosDto.inventoriesIds,
        companyId,
      );
    } else {
      const inventoriesIds = (await this.findAll(companyId)).map(
        (inventory) => {
          return inventory.id;
        },
      );
      createPosDto.inventoriesIds = inventoriesIds;
    }

    return await this.prisma.inventoryAndPos.create({
      data: {
        name: createPosDto.name,
        address: createPosDto.address,
        type: EntityType.POS,
        totalQuantity: 0,
        deleted: false,
        company: { connect: { id: companyId } },
        posHas: {
          create: createPosDto.inventoriesIds.map((id) => ({
            inventory: { connect: { id: id } },
          })),
        },
      },
      select: {
        address: true,
        id: true,
        name: true,
        posHas: {
          where: { inventory: { deleted: false } },
          select: {
            inventory: { select: { address: true, id: true, name: true } },
          },
        },
        InventoryPosItems: {
          select: {
            quantity: true,
            item: true,
            specification: true,
            price: true,
          },
        },
      },
    });
  }

  async findAll(companyId: number) {
    return await this.prisma.inventoryAndPos.findMany({
      where: { deleted: false, companyId, type: EntityType.POS },
      select: { address: true, id: true, name: true },
    });
  }

  async findOne(id: number, companyId: number) {
    return await this.prisma.inventoryAndPos.findUnique({
      where: {
        id: id,
        companyId,
        deleted: false,
        type: EntityType.POS,
      },
      select: {
        address: true,
        id: true,
        name: true,
        posHas: {
          where: { inventory: { deleted: false } },
          select: {
            inventory: { select: { address: true, id: true, name: true } },
          },
        },
        InventoryPosItems: {
          select: {
            quantity: true,
            item: true,
            specification: true,
            price: true,
          },
        },
      },
    });
  }

  async delete(id: number, companyId: number) {
    const existingPos = await this.prisma.inventoryAndPos.findUnique({
      where: { id: id, companyId, deleted: false, type: EntityType.POS },
    });
    if (!existingPos) {
      throw new NotFoundException('pos with ID ' + id + ' not found');
    }
    await this.prisma.inventoryAndPos.update({
      where: { id: id, type: EntityType.POS },
      data: {
        deleted: true,
      },
    });
  }

  async upate(id: number, updatePosDto: UpdatePosDto, companyId: number) {
    if (this.checkForDuplicates(updatePosDto.inventoriesIds)) {
      throw new BadRequestException('Duplicate Inventory ID');
    }
    const existingPos = await this.prisma.inventoryAndPos.findUnique({
      where: { id: id, companyId, deleted: false, type: EntityType.POS },
      include: { posHas: true },
    });
    if (!existingPos) {
      throw new NotFoundException('pos with ID ' + id + ' not found');
    }
    //check
    const inventoriesCount: number[] = await Promise.all(
      updatePosDto.inventoriesIds.map(async (id) => {
        return await this.prisma.inventoryAndPos.count({
          where: { id: id, deleted: false, type: EntityType.INVENTORY },
        });
      }),
    );
    const allInventoriesExist: number = inventoriesCount.findIndex(
      (count) => count == 0,
    );
    if (allInventoriesExist != -1) {
      throw new NotFoundException(
        'inventory ID ' +
          updatePosDto.inventoriesIds[allInventoriesExist] +
          ' Not Found',
      );
    }
    return await this.prisma.inventoryAndPos.update({
      where: { id: id, type: EntityType.POS },
      data: {
        name: updatePosDto.name,
        address: updatePosDto.address,
        type: EntityType.POS,
        totalQuantity: 0,
        deleted: false,
        posHas: {
          deleteMany: existingPos.posHas.map((inventory) => ({
            id: inventory.id,
          })),

          create: updatePosDto.inventoriesIds.map((id) => ({
            inventory: { connect: { id: id } },
          })),
        },
      },
      select: {
        address: true,
        id: true,
        name: true,
        posHas: {
          where: { inventory: { deleted: false } },
          select: {
            inventory: { select: { address: true, id: true, name: true } },
          },
        },
        InventoryPosItems: {
          select: {
            quantity: true,
            price: true,
            item: true,
            specification: true,
          },
        },
      },
    });
  }

  async addItemFormInventory(
    addItemToPosDto: AddItemToPosDto,
    id: number,
    companyId: number,
  ) {
    const inventory = await this.prisma.inventoryAndPos.findUnique({
      where: {
        id: addItemToPosDto.inventoryId,
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
    if (!inventory) throw new NotFoundException('Inventory Not Found');

    const posId = inventory.inventoryBelong.findIndex((inventoryBelong) => {
      return inventoryBelong.pos.id == id && !inventoryBelong.pos.deleted;
    });
    if (posId == -1)
      throw new NotFoundException(
        'Pos Does Not Belong To Inventory Or Not Found',
      );

    let flag: boolean;
    const idLest: number[] = [];
    const allSpecificationsExist = addItemToPosDto.specifications.findIndex(
      (specification) => {
        if (idLest.includes(specification.specificationsId)) {
          throw new BadRequestException('Duplicate Specification ID');
        }
        idLest.push(specification.specificationsId);
        return !inventory.InventoryPosItems.some((inventoryItem) => {
          flag =
            inventoryItem.itemId == addItemToPosDto.itemId &&
            inventoryItem.specificationId == specification.specificationsId &&
            inventoryItem.quantity >= specification.quantity;
          if (flag) {
            specification['inventoryItemId'] = inventoryItem.id;
            specification['inventoryItemQuantity'] = inventoryItem.quantity;
          }
          return flag;
        });
      },
    );
    // the condition is not equal because the findindex is reversed
    if (allSpecificationsExist != -1)
      throw new NotFoundException(
        'Item Specification ID ' +
          addItemToPosDto.specifications[allSpecificationsExist]
            .specificationsId +
          ' Or Item ID ' +
          addItemToPosDto.itemId +
          ' Not Found In Inventory Or Not Enough Quantity',
      );

    const pos = inventory.inventoryBelong[posId].pos;
    await this.prisma.$transaction(async (tx) => {
      let posItemId: number;
      for (const specification of addItemToPosDto.specifications) {
        posItemId = pos.InventoryPosItems.findIndex(
          (posItem) =>
            posItem.itemId == addItemToPosDto.itemId &&
            posItem.specificationId == specification.specificationsId,
        );
        if (posItemId == -1) {
          //create posItem and increase quantity
          await tx.inventoryPosItems.create({
            data: {
              price: specification.price,
              quantity: specification.quantity,
              inventoryOrPos: {
                connect: { id: id },
              },
              item: { connect: { id: addItemToPosDto.itemId } },
              specification: {
                connect: { id: specification.specificationsId },
              },
            },
          });
        } else {
          //increase quantity
          await tx.inventoryPosItems.update({
            where: { id: pos.InventoryPosItems[posItemId].id },
            data: {
              price: specification.price,
              quantity:
                pos.InventoryPosItems[posItemId].quantity +
                specification.quantity,
            },
          });
        }
        pos.totalQuantity = pos.totalQuantity + specification.quantity;
        inventory.totalQuantity =
          inventory.totalQuantity - specification.quantity;
        await tx.inventoryPosItems.update({
          where: { id: specification['inventoryItemId'] },
          data: {
            quantity:
              specification['inventoryItemQuantity'] - specification.quantity,
          },
        });
      }
      await tx.inventoryAndPos.update({
        where: { id: pos.id, type: EntityType.POS },
        data: { totalQuantity: pos.totalQuantity },
      });
      await tx.inventoryAndPos.update({
        where: { id: inventory.id, type: EntityType.INVENTORY },
        data: { totalQuantity: inventory.totalQuantity },
      });
    });
  }

  async requestItem(
    requestItemDto: RequestItemDto,
    id: number,
    companyId: number,
  ) {
    const to = await this.prisma.inventoryAndPos.findUnique({
      where: {
        id: id,
        deleted: false,
        type: EntityType.POS,
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
    const from = await this.prisma.inventoryAndPos.findUnique({
      where: {
        id: requestItemDto.from,
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
    if (from.type == EntityType.INVENTORY) {
      const posId = from.inventoryBelong.findIndex((inventoryBelong) => {
        return inventoryBelong.pos.id == id && !inventoryBelong.pos.deleted;
      });
      if (posId == -1)
        throw new NotFoundException(
          'Pos Does Not Belong To Inventory Or Not Found',
        );
    }
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
    await this.prisma.$transaction(async (tx) => {
      req = await tx.request.create({
        data: {
          company: { connect: { id: companyId } },
          item: { connect: { id: requestItemDto.itemId } },
          from: {
            connect: { id: requestItemDto.from },
          },
          to: {
            connect: { id: id },
          },
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
            price: specification.price,
          },
        });
      }
    });
    await this.acceptItemRequest(from.id, req.id);
  }

  async findAllRequestItem(id: number, companyId: number) {
    const request = await this.prisma.request.findMany({
      where: {
        deleted: false,
        OR: [{ fromId: id }, { toId: id }],
        companyId,
        from: { type: EntityType.POS, deleted: false },
      },
      select: {
        id: true,
        from: { select: { id: true, name: true, address: true } },
        to: { select: { id: true, name: true, address: true } },
        createdAt: true,
        inventoryPosItemRequest: {
          select: {
            specification: true,
            quantity: true,
            item: true,
            price: true,
          },
        },
      },
    });

    return request;
  }

  async acceptItemRequest(posId: number, requestId: number) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId, fromId: posId, deleted: false },
      include: {
        inventoryPosItemRequest: { include: { specification: true } },
        to: { include: { InventoryPosItems: true } },
      },
    });
    if (!request) throw new NotFoundException('Request Not Found');
    if (request.fromId != posId)
      throw new BadRequestException(
        'The Pos Id Is Not The Same As The Pos Id In The Request',
      );
    const from = await this.prisma.inventoryAndPos.findUnique({
      where: {
        id: posId,
        deleted: false,
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
    const to = await this.prisma.inventoryAndPos.findUnique({
      where: {
        id: request.toId,
        deleted: false,
        type: EntityType.POS,
      },
      include: {
        InventoryPosItems: true,
      },
    });
    if (!to)
      throw new NotFoundException(
        'Pos Or Inventory You Are Sending To Is Not Found',
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

    await this.prisma.$transaction(async (tx) => {
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
              price: specification.price,
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
            },
          });
        }
        await tx.inventoryPosItems.update({
          where: { id: specification['fromItemId'] },
          data: {
            quantity:
              specification['fromItemQuantity'] - specification.quantity,
            price: specification.price,
          },
        });
        from.totalQuantity = from.totalQuantity - specification.quantity;
        to.totalQuantity = to.totalQuantity + specification.quantity;
      }
      await tx.inventoryAndPos.update({
        where: { id: from.id },
        data: { totalQuantity: from.totalQuantity },
      });
      await tx.inventoryAndPos.update({
        where: { id: to.id, type: to.type },
        data: { totalQuantity: to.totalQuantity },
      });
    });
  }
}

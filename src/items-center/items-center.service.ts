import { Injectable } from '@nestjs/common';
import {
  CreateItemsCenterDto,
  ClotheSpecifications,
} from './dto/create-items-center.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ItemsType, Prisma } from '@prisma/client';
import { UpdateItemsCenterDto } from './dto/update-items-center.dto';
import { FilterDto, SearchDto } from './dto/search.dto';

@Injectable()
export class ItemsCenterService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createItemsCenterDto: CreateItemsCenterDto, companyId: number) {
    let specifications = [];
    if (createItemsCenterDto.type == ItemsType.CLOTHES) {
      specifications = this.linkColorNameWithItsSizes(
        createItemsCenterDto.specification,
      );
    }
    const item = await this.prismaService.item.create({
      data: {
        name: createItemsCenterDto.name,
        description: createItemsCenterDto.description,
        cost: createItemsCenterDto.cost,
        type: createItemsCenterDto.type,
        specifications: { create: specifications },

        company: { connect: { id: companyId } },
      },
      include: {
        specifications: true,
      },
    });
    return item;
  }
  private linkColorNameWithItsSizes(specifications: ClotheSpecifications[]) {
    return specifications.flatMap((item) =>
      item.sizes.map((size) => ({ colorName: item.colorName, size: size })),
    );
  }

  async findAll(filterhDto: FilterDto, companyId: number) {
    const query: Prisma.ItemFindManyArgs = {
      where: {
        companyId,
        deleted: false,
      },
    };

    if (filterhDto?.type) {
      query.where.type = filterhDto.type;
    }

    return await this.prismaService.item.findMany({
      ...query,
      include: { specifications: true },
    });
  }

  async findOne(id: number, companyId: number) {
    return await this.prismaService.item.findFirst({
      where: { id: id, deleted: false, companyId },
      include: {
        specifications: true,
      },
    });
  }

  async update(
    id: number,
    updateItemsCenterDto: UpdateItemsCenterDto,
    companyId: number,
  ) {
    let specifications = [];
    if (updateItemsCenterDto.type == ItemsType.CLOTHES) {
      specifications = this.linkColorNameWithItsSizes(
        updateItemsCenterDto.specification,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, item] = await this.prismaService.$transaction([
      this.prismaService.clothesSpecification.deleteMany({
        where: { itemId: id },
      }),
      this.prismaService.item.update({
        where: { id: id, companyId },
        data: {
          name: updateItemsCenterDto.name,
          description: updateItemsCenterDto.description,
          cost: updateItemsCenterDto.cost,
          type: updateItemsCenterDto.type,
          specifications: { create: specifications },
        },
        include: {
          specifications: true,
        },
      }),
    ]);
    return item;
  }

  async remove(id: number, companyId: number) {
    await this.prismaService.item.update({
      where: { id: id, companyId },
      data: { deleted: true },
    });
  }

  async search(searchDto: SearchDto, companyId: number) {
    const items = await this.prismaService.item.findMany({
      where: {
        companyId,
        name: { contains: searchDto.keyword },
      },
      include: {
        specifications: {
          select: {
            id: true,
            colorName: true,
            size: true,
          },
        },
      },
    });
    return items;
  }
}

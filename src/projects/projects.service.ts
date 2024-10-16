import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatepProjectDto, UpdateProjectDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createpProjectDto: CreatepProjectDto, companyId: number) {
    const client = await this.prisma.client.findFirst({
      where: { id: createpProjectDto.clientId, companyId, deleted: false },
    });
    if (!client) throw new NotFoundException('client ID not found');
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        forecastedCost: { increment: createpProjectDto.forecastedCost },
        forecastedPrice: { increment: createpProjectDto.forecastedPrice },
      },
    });
    return await this.prisma.project.create({
      data: {
        company: { connect: { id: companyId } },
        title: createpProjectDto.title,
        forecastedCost: createpProjectDto.forecastedCost,
        forecastedPrice: createpProjectDto.forecastedPrice,
        startDate: createpProjectDto.startDate,
        endDate: createpProjectDto.endDate,
        client: { connect: { id: createpProjectDto.clientId } },
      },
      include: {
        invoices: true,
        client: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });
  }

  async findAll(companyId: number) {
    return await this.prisma.project.findMany({
      where: { deleted: false, companyId },
      select: {
        id: true,
        title: true,
        client: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        startDate: true,
        endDate: true,
      },
    });
  }

  async findOne(id: number, companyId: number) {
    const project = await this.prisma.project.findFirst({
      where: { id: id, deleted: false, companyId },
      select: {
        id: true,
        title: true,
        owner: true,
        forecastedCost: true,
        actualCost: true,
        forecastedPrice: true,
        actualPrice: true,
        startDate: true,
        endDate: true,
        netProfit: true,
        accountsPayable: true,
        accountsReceivable: true,
        invoices: {
          include: {
            client: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
            items: true,
          },
        },
        client: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });
    project.netProfit = project.actualPrice - project.actualCost;
    return project;
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    companyId: number,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: id, companyId, deleted: false },
    });
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        forecastedCost: { decrement: project.forecastedCost },
        forecastedPrice: { decrement: project.forecastedPrice },
      },
    });
    if (!project) throw new NotFoundException('project ID not found');
    const client = await this.prisma.client.findFirst({
      where: { id: updateProjectDto.clientId, deleted: false },
    });
    if (!client) throw new NotFoundException('client ID not found');
    const Updatedproject = await this.prisma.project.update({
      where: { id: id, deleted: false },
      data: {
        title: updateProjectDto.title,
        forecastedCost: updateProjectDto.forecastedCost,
        forecastedPrice: updateProjectDto.forecastedPrice,
        startDate: updateProjectDto.startDate,
        endDate: updateProjectDto.endDate,
        client: { connect: { id: updateProjectDto.clientId } },
      },
      select: {
        id: true,
        title: true,
        owner: true,
        forecastedCost: true,
        actualCost: true,
        forecastedPrice: true,
        actualPrice: true,
        startDate: true,
        endDate: true,
        netProfit: true,
        accountsPayable: true,
        accountsReceivable: true,
        invoices: {
          include: {
            items: true,
          },
        },
        client: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
    });
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        forecastedCost: { increment: updateProjectDto.forecastedCost },
        forecastedPrice: { increment: updateProjectDto.forecastedPrice },
      },
    });
    Updatedproject.netProfit =
      Updatedproject.actualPrice - Updatedproject.actualCost;
    return project;
  }

  async remove(id: number, companyId: number) {
    const project = await this.prisma.project.update({
      where: { companyId, id: id, deleted: false },
      data: { deleted: true },
    });
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        forecastedCost: { decrement: project.forecastedCost },
        forecastedPrice: { decrement: project.forecastedPrice },
      },
    });
  }
}

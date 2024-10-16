import { Injectable } from '@nestjs/common';
import { Client } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactDto } from './dto/createContact.dto';
import { UpdateContactDto } from './dto/updateContact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ContactDto, companyId: number): Promise<Client> {
    return this.prisma.client.create({
      data: { ...data, company: { connect: { id: companyId } } },
    });
  }

  async findAll(companyId: number): Promise<Client[]> {
    return this.prisma.client.findMany({
      where: { companyId, deleted: false },
    });
  }

  async findOne(id: number, companyId: number): Promise<Client> {
    return this.prisma.client.findUnique({
      where: { id, companyId, deleted: false },
    });
  }

  async update(
    id: number,
    data: UpdateContactDto,
    companyId: number,
  ): Promise<Client> {
    return this.prisma.client.update({
      where: { id, companyId, deleted: false },
      data,
    });
  }

  async remove(id: number, companyId: number): Promise<void> {
    await this.prisma.client.update({
      where: { id, companyId },
      data: {
        deleted: true,
      },
    });
  }
}

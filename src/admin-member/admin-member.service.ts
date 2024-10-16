import { AdminMembersDto } from './dto/adminMember.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
@Injectable()
export class AdminMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: AdminMembersDto, companyId: number): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: await bcrypt.hash(data.password, 10),
        fullName: data.fullName,
        phonenumber: data.phonenumber,
        company: { connect: { id: companyId } },
        role: { connect: { id: data.roleId } },
      },
      include: {
        role: {
          select: {
            roleName: true,
          },
        },
      },
    });
  }

  async findAll(companyId: number): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { companyId },
      include: { role: { select: { roleName: true } } },
    });
  }

  async findOne(id: number, companyId: number) {
    return this.prisma.user.findUnique({
      where: { id, companyId },
      include: { role: { include: { permissions: true } } },
    });
  }

  async update(
    id: number,
    data: AdminMembersDto,
    companyId: number,
  ): Promise<User> {
    data.password = await bcrypt.hash(data.password, 10);
    return this.prisma.user.update({
      where: { id, companyId },
      data,
      include: { role: { select: { roleName: true } } },
    });
  }

  async remove(id: number, companyId: number): Promise<void> {
    await this.prisma.user.delete({ where: { id, companyId } });
  }
}

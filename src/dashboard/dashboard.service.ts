import bcrypt from 'bcrypt';
import { HttpException, Injectable } from '@nestjs/common';
import { DashboardAuthDto } from './dto/dashboard-auth.dto';
import { SubscribeCompanyDto } from './dto/subscribe-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateSubscribeCompanyDto } from './dto/update-subscribe-company.dto';
import { Permission } from 'src/global/enums';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn({ email, password }: DashboardAuthDto) {
    const owner = await this.prisma.owner.findUnique({ where: { email } });
    if (!owner) {
      throw new HttpException('Email not exists', 401);
    }
    const areEqual = await bcrypt.compare(password, owner.password);
    if (!areEqual) {
      throw new HttpException('Wrong Password', 401);
    }
    const payload = { id: owner.id, email: owner.email };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async getme(idOfUser: number) {
    return await this.prisma.owner.findUnique({
      where: { id: idOfUser },
      select: { id: true, email: true },
    });
  }
  async subscribeCompany(subscribeCompanyDto: SubscribeCompanyDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: subscribeCompanyDto.email },
    });
    if (user) {
      throw new HttpException('Email already exists', 409);
    }
    const permissions: string[] = [];
    Object.values(Permission).forEach((permission) => {
      permissions.push(permission);
    });
    const createdPermissions = [];
    const company = await this.prisma.company.create({
      data: {
        name: subscribeCompanyDto.companyName,
        endDate: subscribeCompanyDto.endDate,
      },
      select: { id: true, endDate: true, startDate: true, name: true },
    });
    for (let index = 0; index < permissions.length; index++) {
      createdPermissions.push(
        await this.prisma.permission.create({
          data: {
            title: permissions[index],
            company: { connect: { id: company.id } },
          },
        }),
      );
    }
    await this.prisma.user.create({
      data: {
        email: subscribeCompanyDto.email,
        password: await bcrypt.hash(subscribeCompanyDto.password, 10),
        fullName: subscribeCompanyDto.fullName,
        phonenumber: subscribeCompanyDto.phonenumber,
        company: { connect: { id: company.id } },
        role: {
          create: {
            company: { connect: { id: company.id } },
            roleName: 'all',
            permissions: {
              connect: createdPermissions,
            },
          },
        },
      },
    });

    return company;
  }

  async findAll() {
    return await this.prisma.company.findMany({
      select: { id: true, name: true, startDate: true, endDate: true },
    });
  }

  async findOne(id: number) {
    return await this.prisma.company.findFirst({
      where: { id: id },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
  }

  async update(
    id: number,
    updateSubscribeCompanyDto: UpdateSubscribeCompanyDto,
  ) {
    return await this.prisma.company.update({
      where: { id: id },
      data: {
        endDate: updateSubscribeCompanyDto.endDate,
      },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
  }
}

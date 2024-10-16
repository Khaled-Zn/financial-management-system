import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class UpdateUniqueEmailPipe implements PipeTransform {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async transform(value: any) {
    const id = +this.request.params.id;
    const email = value.email;

    if (email) {
      const currentUser = await this.prismaService.client.findUnique({
        where: { id },
      });

      if (currentUser.email === email) {
        return value;
      }

      const userWithEmail = await this.prismaService.client.findUnique({
        where: { email },
      });

      if (userWithEmail) {
        throw new BadRequestException('This email has already been taken');
      }
    }
    return value;
  }
}

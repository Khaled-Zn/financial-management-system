import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UniqueEmailPipe implements PipeTransform {
  constructor(private readonly prismaService: PrismaService) {}

  async transform(value: any) {
    const email = value.email;

    if (email) {
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

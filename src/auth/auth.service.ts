import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { HttpException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPayload } from 'src/global/@types';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn({ email, password }: AuthDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('Email not exists', 401);
    }
    const areEqual = await bcrypt.compare(password, user.password);
    if (!areEqual) {
      throw new HttpException('Wrong Password', 401);
    }
    const payload = { id: user.id, company: user.companyId };
    return {
      token: await this.jwtService.signAsync(payload),
    };
  }

  async getme(userPayload: UserPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: userPayload.id, companyId: userPayload.company },
      include: { role: { include: { permissions: true } } },
    });
    const company = await this.prisma.company.findFirst({
      where: { id: user.companyId },
      select: {
        logo: true,
        name: true,
        id: true,
      },
    });
    return { user, company };
  }
}

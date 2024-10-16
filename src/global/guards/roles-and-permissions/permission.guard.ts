import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<Permission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermission) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: { include: { permissions: true } } },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (!user.role) {
      throw new NotFoundException('role not found');
    }
    return user.role.permissions.some(
      (permission) => permission.title == requiredPermission,
    );
  }
}

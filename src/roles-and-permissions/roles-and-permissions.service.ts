import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesAndPermissionsService {
  constructor(private prisma: PrismaService) {}
  async getPermissons(companyId: number) {
    const defualtRole = await this.prisma.role.findFirst({
      where: { companyId },
      include: { permissions: true },
    });

    if (!defualtRole) throw new NotFoundException('role not found');
    defualtRole.permissions = [];
    return defualtRole;
  }

  async getRoles(companyId: number) {
    return await this.prisma.role.findMany({
      where: { companyId },
      include: { permissions: true },
    });
  }

  async getRole(id: number, companyId: number) {
    const role = await this.prisma.role.findUnique({
      where: { id: id, companyId },
      include: { permissions: true },
    });
    if (!role) throw new NotFoundException('role not found');
    return role;
  }

  async getPermissionsIds(companyId: number) {
    const permissions = await this.prisma.permission.findMany({
      where: { companyId },
    });
    const signaturePermissions: { [key: string]: number } = {};
    permissions.forEach((permission) => {
      signaturePermissions[permission.title] = permission.id;
    });
    return signaturePermissions;
  }

  //create role
  async createRole(createRoleDto: CreateRoleDto, companyId: number) {
    // check if permissions exist
    const permissionsCount: number[] = await Promise.all(
      createRoleDto.permissionsIds.map(async (id) => {
        return await this.prisma.permission.count({
          where: { id: id, companyId },
        });
      }),
    );
    const allPermissionsExist: number = permissionsCount.findIndex(
      (count) => count == 0,
    );
    if (allPermissionsExist != -1) {
      throw new NotFoundException(
        'permission ID ' +
          createRoleDto.permissionsIds[allPermissionsExist] +
          ' Not Found',
      );
    }
    // create a role
    const role = await this.prisma.role.create({
      data: {
        roleName: createRoleDto.roleName,
        company: { connect: { id: companyId } },
        permissions: {
          connect: createRoleDto.permissionsIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });
    return role;
  }

  //update role
  async updateRole(
    roleId: number,
    updateRoleDto: UpdateRoleDto,
    companyId: number,
  ) {
    if (roleId == 1)
      throw new ForbiddenException('can not update the main role');
    // Check if role exists
    const existingRole = await this.prisma.role.findUnique({
      where: { id: roleId, companyId },
      include: { permissions: true },
    });

    if (!existingRole) {
      throw new NotFoundException('Role with ID ' + roleId + ' not found');
    }

    // Check if permissions exist
    const permissionsCount: number[] = await Promise.all(
      updateRoleDto.permissionsIds.map(async (id) => {
        return await this.prisma.permission.count({
          where: { id: id, companyId },
        });
      }),
    );
    const allPermissionsExist: number = permissionsCount.findIndex(
      (count) => count == 0,
    );
    if (allPermissionsExist != -1) {
      throw new NotFoundException(
        'permission ID ' +
          updateRoleDto.permissionsIds[allPermissionsExist] +
          ' Not Found',
      );
    }

    // Update role data
    const updatedRole = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        roleName: updateRoleDto.roleName,
        permissions: {
          disconnect: existingRole.permissions.map((permission) => ({
            id: permission.id,
          })),
          connect: updateRoleDto.permissionsIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });

    return updatedRole;
  }

  async deleteRole(roleId: number, companyId: number) {
    // Check if role exists
    const existingRole = await this.prisma.role.findUnique({
      where: { id: roleId, companyId },
    });

    if (!existingRole) {
      throw new NotFoundException('Role with ID ' + roleId + ' not found');
    }

    // Delete the role
    await this.prisma.role.delete({
      where: { id: roleId },
    });
  }
}

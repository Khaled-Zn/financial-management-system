import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RolesAndPermissionsService } from './roles-and-permissions.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { RequiredPermission } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleEntity } from './entities/role.entity';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';
import { UserPayload } from 'src/global/@types';

@Controller('roles-and-permissions')
@ApiTags('Roles And Permissions')
@ApiBearerAuth('access_token')
export class RolesAndPermissionsController {
  constructor(private rolesAndPermissionsService: RolesAndPermissionsService) {}

  @Get('permissons')
  @RequiredPermission(Permission.READ_ROLES_AND_PERMISSIONS)
  async getPermissons(@userMetaDate() userPayload: UserPayload) {
    return RoleEntity.createInstance(
      await this.rolesAndPermissionsService.getPermissons(userPayload.company),
      await this.rolesAndPermissionsService.getPermissionsIds(
        userPayload.company,
      ),
    ).groupedPermissions;
  }

  @Get('roles')
  @RequiredPermission(Permission.READ_ROLES_AND_PERMISSIONS)
  async getRoles(@userMetaDate() userPayload: UserPayload) {
    return RoleEntity.createInstance(
      await this.rolesAndPermissionsService.getRoles(userPayload.company),
      await this.rolesAndPermissionsService.getPermissionsIds(
        userPayload.company,
      ),
    );
  }

  @Get('roles/:id')
  @RequiredPermission(Permission.READ_ROLES_AND_PERMISSIONS)
  async getRole(
    @Param('id') id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return RoleEntity.createInstance(
      await this.rolesAndPermissionsService.getRole(+id, userPayload.company),
      await this.rolesAndPermissionsService.getPermissionsIds(
        userPayload.company,
      ),
    );
  }

  @Post('role/create')
  @RequiredPermission(Permission.WRITE_ROLES_AND_PERMISSIONS)
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return RoleEntity.createInstance(
      await this.rolesAndPermissionsService.createRole(
        createRoleDto,
        userPayload.company,
      ),
      await this.rolesAndPermissionsService.getPermissionsIds(
        userPayload.company,
      ),
    );
  }

  @Put('role/update/:roleId')
  @RequiredPermission(Permission.UPDATE_ROLES_AND_PERMISSIONS)
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    return RoleEntity.createInstance(
      await this.rolesAndPermissionsService.updateRole(
        +roleId,
        updateRoleDto,
        userPayload.company,
      ),
      await this.rolesAndPermissionsService.getPermissionsIds(
        userPayload.company,
      ),
    );
  }

  @Delete('role/delete/:roleId')
  @RequiredPermission(Permission.DELETE_ROLES_AND_PERMISSIONS)
  async deleteRole(
    @Param('roleId') roleId: number,
    @userMetaDate() userPayload: UserPayload,
  ) {
    await this.rolesAndPermissionsService.deleteRole(
      roleId,
      userPayload.company,
    );
  }
}

import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  ParseIntPipe,
  HttpException,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { AdminMemberService } from './admin-member.service';
import { AdminMembersDto } from './dto/adminMember.dto';
import { UpdateAdminMembersDto } from './dto/updateAdminMemer.dto';
import { AdminMemberEntity } from './entities/adminMember.entity';
import { UniqueEmailPipe } from './pipes/email-unique.validator.pipe';
import { RequiredPermission } from 'src/global/decorators/required-permission.decorator';
import { Permission } from 'src/global/enums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesAndPermissionsService } from 'src/roles-and-permissions/roles-and-permissions.service';
import { UpdateUniqueEmailPipe } from './pipes/update-email-unique.validator.pipe';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';
import { UserPayload } from 'src/global/@types';
import { RoleEntity } from 'src/roles-and-permissions/entities/role.entity';

@Controller('admin-member')
@ApiTags('Admin-members')
@ApiBearerAuth('access_token')
export class AdminMemberController {
  constructor(
    private readonly adminMemberService: AdminMemberService,
    private rolesAndPermissionsService: RolesAndPermissionsService,
  ) {}

  @Post('create')
  @UsePipes(UniqueEmailPipe)
  @RequiredPermission(Permission.WRITE_ADMIN_MEMBERS)
  async create(
    @Body() adminMemberDto: AdminMembersDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const AdminMember = await this.adminMemberService.create(
      adminMemberDto,
      userPayload.company,
    );
    return AdminMember;
  }

  @Get('getAll')
  @RequiredPermission(Permission.READ_ADMIN_MEMBERS)
  async findAll(@userMetaDate() userPayload: UserPayload) {
    const AdminMember = await this.adminMemberService.findAll(
      userPayload.company,
    );
    return AdminMember;
  }

  @Get(':id')
  @RequiredPermission(Permission.READ_ADMIN_MEMBERS)
  async findOne(
    @Param('id', ParseIntPipe) id: string,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const AdminMember = await this.adminMemberService.findOne(
      +id,
      userPayload.company,
    );
    if (!AdminMember) {
      throw new HttpException('Not Found', 404);
    }
    let role;
    if (AdminMember.role) {
      role = RoleEntity.createInstance(
        AdminMember.role,
        await this.rolesAndPermissionsService.getPermissionsIds(
          userPayload.company,
        ),
      );
    }
    return { ...AdminMemberEntity.createInstance(AdminMember), role };
  }

  @Put(':id')
  @UsePipes(UpdateUniqueEmailPipe)
  @RequiredPermission(Permission.UPDATE_ADMIN_MEMBERS)
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateAdminMemberDto: UpdateAdminMembersDto,
    @userMetaDate() userPayload: UserPayload,
  ) {
    const Admin = await this.adminMemberService.findOne(
      +id,
      userPayload.company,
    );
    if (!Admin) {
      throw new HttpException('Not Found', 404);
    }
    const AdminMember = await this.adminMemberService.update(
      +id,
      updateAdminMemberDto,
      userPayload.company,
    );
    return AdminMember;
  }

  @Delete(':id')
  @RequiredPermission(Permission.DELETE_ADMIN_MEMBERS)
  async remove(
    @Param('id', ParseIntPipe) id: string,
    @userMetaDate() userPayload: UserPayload,
  ): Promise<void> {
    const AdminMember = await this.adminMemberService.findOne(
      +id,
      userPayload.company,
    );
    if (!AdminMember) {
      throw new HttpException('Not Found', 404);
    }
    if (userPayload.id == +id) {
      throw new BadRequestException('You can not delete yourself');
    }
    return this.adminMemberService.remove(+id, userPayload.company);
  }
}

import { Controller, Post, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { UserEntity } from './entities/auth.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/global/decorators/public.decorator';
import { RolesAndPermissionsService } from 'src/roles-and-permissions/roles-and-permissions.service';
import { RoleEntity } from 'src/roles-and-permissions/entities/role.entity';
import { userMetaDate } from 'src/global/decorators/user-id.decorator';
import type { UserPayload } from 'src/global/@types';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private rolesAndPermissionsService: RolesAndPermissionsService,
  ) {}

  @Post('login')
  @Public()
  login(@Body() authDto: AuthDto) {
    return this.authService.signIn(authDto);
  }

  @ApiBearerAuth('access_token')
  @Get('getme')
  async getme(@userMetaDate() userPayload: UserPayload) {
    const me = await this.authService.getme(userPayload);
    const role = RoleEntity.createInstance(
      me.user.role,
      await this.rolesAndPermissionsService.getPermissionsIds(
        userPayload.company,
      ),
    );
    const permissions = role.permissionsEnum;
    delete role.permissionsEnum;
    return {
      ...UserEntity.createInstance(me.user),
      company: me.company,
      role,
      permissions,
    };
  }
}

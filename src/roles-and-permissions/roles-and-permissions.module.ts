import { Module } from '@nestjs/common';
import { RolesAndPermissionsController } from './roles-and-permissions.controller';
import { RolesAndPermissionsService } from './roles-and-permissions.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [RolesAndPermissionsController],
  providers: [RolesAndPermissionsService, JwtService],
})
export class RolesAndPermissionsModule {}

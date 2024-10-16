import { Module } from '@nestjs/common';
import { AdminMemberController } from './admin-member.controller';
import { AdminMemberService } from './admin-member.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesAndPermissionsService } from 'src/roles-and-permissions/roles-and-permissions.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminMemberController],
  providers: [AdminMemberService, RolesAndPermissionsService],
})
export class AdminMemberModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesAndPermissionsService } from 'src/roles-and-permissions/roles-and-permissions.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jWT_SECRET_KEY'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RolesAndPermissionsService],
})
export class AuthModule {}

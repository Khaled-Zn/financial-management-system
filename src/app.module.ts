import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app-service.service';
import { AuthModule } from './auth/auth.module';
import { AdminMemberModule } from './admin-member/admin-member.module';
import { RolesAndPermissionsModule } from './roles-and-permissions/roles-and-permissions.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './global/guards/auth/auth.guard';
import { PermissionsGuard } from './global/guards/roles-and-permissions/permission.guard';
import { ItemsCenterModule } from './items-center/items-center.module';
import { PosModule } from './pos/pos.module';
import { InventoriesModule } from './inventories/inventories.module';
import { ProjectsModule } from './projects/projects.module';
import { ContactModule } from './contact/contact.module';
import { SalesModule } from './sales/sales.module';
import { MediaModule } from './media/media.module';
import { PaymentModule } from './payment/payment.module';
import { InvoicesModule } from './invoices/invoices.module';
import { MovementsModule } from './movements/movements.module';
import { StatisticsModule } from './statistics/statistics.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AdminMemberModule,
    RolesAndPermissionsModule,
    ItemsCenterModule,
    PosModule,
    InventoriesModule,
    SalesModule,
    ProjectsModule,
    ContactModule,
    MediaModule,
    PaymentModule,
    InvoicesModule,
    MovementsModule,
    StatisticsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}

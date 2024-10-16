import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { MovementsModule } from 'src/movements/movements.module';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService],
  imports: [MovementsModule],
})
export class InvoicesModule {}

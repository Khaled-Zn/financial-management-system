import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MovementsModule } from 'src/movements/movements.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [MovementsModule],
})
export class PaymentModule {}

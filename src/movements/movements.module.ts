import { Module } from '@nestjs/common';
import { MovementsService } from './movement.service';

@Module({
  providers: [MovementsService],
  exports: [MovementsService],
})
export class MovementsModule {}

import { Module } from '@nestjs/common';
import { ItemsCenterService } from './items-center.service';
import { ItemsCenterController } from './items-center.controller';

@Module({
  controllers: [ItemsCenterController],
  providers: [ItemsCenterService],
})
export class ItemsCenterModule {}

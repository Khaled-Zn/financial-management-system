import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { RequestItemDto } from 'src/pos/dto';

export class RequestInventoryItemDto extends OmitType(RequestItemDto, [
  'from',
]) {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  inventoryId: number;
}

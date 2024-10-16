import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

class Specification {
  @ApiProperty()
  @IsNumber()
  sizeSpecificationsId: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class AddItemToInventoryDto {
  @ApiProperty()
  @IsNumber()
  itemId: number;

  @ApiProperty({ isArray: true, type: Specification })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Specification)
  specifications: Specification[];
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

class Specifications {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  specificationsId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export class AddItemToPosDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  inventoryId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({ isArray: true, type: Specifications })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Specifications)
  specifications: Specifications[];
}

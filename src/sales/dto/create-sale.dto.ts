import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

class SaleSpecifications {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  sizeSpecificationsId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  posId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({ type: [SaleSpecifications] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleSpecifications)
  specifications: SaleSpecifications[];
}

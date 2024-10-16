import { ApiProperty } from '@nestjs/swagger';
import { ItemsType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class ClotheSpecifications {
  @ApiProperty()
  @IsString()
  colorName: string;
  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  @IsString({ each: true })
  sizes: string[];
}

export class CreateItemsCenterDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  cost: number;

  @ApiProperty({ enum: ItemsType })
  @IsEnum(ItemsType)
  type: ItemsType;

  @ApiProperty({ type: ClotheSpecifications, isArray: true, required: false })
  @ValidateIf((o: CreateItemsCenterDto) => o.type == ItemsType.CLOTHES)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClotheSpecifications)
  specification: ClotheSpecifications[];
}

import { ApiProperty } from '@nestjs/swagger';
import { ItemsType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @ApiProperty()
  @IsString()
  keyword: string;
}

export class FilterDto {
  @ApiProperty({ enum: ItemsType, required: false })
  @IsOptional()
  @IsEnum(ItemsType)
  type: ItemsType;
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

class RequestSpecifications {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  sizeSpecificationsId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  price: number;
}

export class RequestItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  from: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({ isArray: true, type: RequestSpecifications })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RequestSpecifications)
  specifications: RequestSpecifications[];
}

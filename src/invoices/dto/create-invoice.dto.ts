import { ApiProperty } from '@nestjs/swagger';
import { InvoiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class InvoiceItem {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  chargingPrice: number;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({ isArray: true, type: InvoiceItem })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItem)
  items: InvoiceItem[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dueDate: Date;

  @ApiProperty({ enum: InvoiceType })
  @IsEnum(InvoiceType)
  type: InvoiceType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  projectId?: number;

  @ApiProperty({ type: Number, isArray: true, required: false })
  @IsArray()
  @IsNumber(null, { each: true })
  @IsOptional()
  attachments?: number[];
}

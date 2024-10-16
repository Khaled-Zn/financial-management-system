import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatepProjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  forecastedCost: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  forecastedPrice: number;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;
}

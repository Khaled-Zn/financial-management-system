import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class FilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  project: number;
}

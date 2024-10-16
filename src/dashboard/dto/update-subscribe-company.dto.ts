import { IsDate, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateSubscribeCompanyDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @ApiProperty({ isArray: true, type: Number })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  permissionsIds: number[];
}

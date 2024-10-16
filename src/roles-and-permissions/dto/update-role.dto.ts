import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateRoleDto {
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

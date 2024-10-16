import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateAdminMembersDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  roleId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phonenumber: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '12345678', minLength: 8, description: 'At least 8 characters' })
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  password!: string;
}

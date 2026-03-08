import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWalletDto {
  @ApiPropertyOptional({ description: 'User-facing label for the wallet' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  label?: string;
}

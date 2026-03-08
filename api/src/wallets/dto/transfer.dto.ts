import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class TransferDto {
  @ApiProperty({ description: 'Source wallet id (must belong to current user)' })
  @IsUUID()
  @IsNotEmpty()
  fromWalletId!: string;

  @ApiProperty({ description: 'Destination wallet id' })
  @IsUUID()
  @IsNotEmpty()
  toWalletId!: string;

  @ApiProperty({ description: 'Transfer amount' })
  @IsNumber()
  @IsPositive()
  amount!: number;
}

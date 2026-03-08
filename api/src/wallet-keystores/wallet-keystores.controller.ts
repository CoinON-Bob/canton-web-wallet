import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WalletKeystoresService } from './wallet-keystores.service';

@ApiTags('wallet-keystores')
@Controller('wallet-keystores')
export class WalletKeystoresController {
  constructor(private readonly service: WalletKeystoresService) {}

  @Get()
  @ApiOperation({ summary: 'List keystores (encrypted only, placeholder)' })
  list() {
    return { message: 'Wallet keystores placeholder - encrypted storage only' };
  }
}

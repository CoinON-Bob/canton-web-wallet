import { Module } from '@nestjs/common';
import { WalletKeystoresController } from './wallet-keystores.controller';
import { WalletKeystoresService } from './wallet-keystores.service';

@Module({
  controllers: [WalletKeystoresController],
  providers: [WalletKeystoresService],
  exports: [WalletKeystoresService],
})
export class WalletKeystoresModule {}

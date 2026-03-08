import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { NodeApiClient } from './node-api.client';
import { CantonWalletService } from './canton-wallet.service';
import { CantonModule } from '../canton/canton.module';
import { WalletKeystoresModule } from '../wallet-keystores/wallet-keystores.module';

@Module({
  imports: [CantonModule, WalletKeystoresModule],
  controllers: [WalletsController],
  providers: [WalletsService, NodeApiClient, CantonWalletService],
  exports: [WalletsService],
})
export class WalletsModule {}

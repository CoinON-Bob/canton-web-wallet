import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NodeApiClient } from './node-api.client';
import { CantonWalletService } from './canton-wallet.service';

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiClient,
    private readonly config: ConfigService,
    private readonly cantonWallet: CantonWalletService,
  ) {}

  private useCantonSdk(): boolean {
    return this.config.get<boolean>('CANTON_USE_SDK', false);
  }

  async create(userId: string, label?: string) {
    if (this.useCantonSdk()) {
      return this.cantonWallet.create(userId, label);
    }
    const nodeAccount = await this.nodeApi.createAccount(label);
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        label: label ?? null,
        nodeAccountId: nodeAccount.id,
      },
    });
    return {
      id: wallet.id,
      userId: wallet.userId,
      label: wallet.label,
      nodeAccountId: wallet.nodeAccountId,
      partyId: nodeAccount.partyId,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async list(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    const withBalance = await Promise.all(
      wallets.map(async (w) => {
        let balance: string | undefined;
        if (w.nodeAccountId) {
          try {
            if (this.useCantonSdk()) {
              balance = await this.cantonWallet.getBalance(w.nodeAccountId);
            } else {
              const acc = await this.nodeApi.getAccount(w.nodeAccountId);
              balance = acc.balance;
            }
          } catch {
            balance = undefined;
          }
        }
        return {
          id: w.id,
          userId: w.userId,
          label: w.label,
          nodeAccountId: w.nodeAccountId,
          balance,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        };
      }),
    );
    return withBalance;
  }

  async findOne(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    let balance: string | undefined;
    const partyId = wallet.nodeAccountId ?? undefined;
    if (wallet.nodeAccountId) {
      try {
        if (this.useCantonSdk()) {
          balance = await this.cantonWallet.getBalance(wallet.nodeAccountId);
        } else {
          const acc = await this.nodeApi.getAccount(wallet.nodeAccountId);
          balance = acc.balance;
        }
      } catch {
        // leave balance undefined
      }
    }
    return {
      id: wallet.id,
      userId: wallet.userId,
      label: wallet.label,
      nodeAccountId: wallet.nodeAccountId,
      partyId,
      balance,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async transfer(
    userId: string,
    fromWalletId: string,
    toWalletId: string,
    amount: number,
  ) {
    if (fromWalletId === toWalletId) {
      throw new BadRequestException('Source and destination must differ');
    }
    const fromWallet = await this.prisma.wallet.findFirst({
      where: { id: fromWalletId, userId },
    });
    if (!fromWallet) {
      throw new NotFoundException('Source wallet not found');
    }
    if (!fromWallet.nodeAccountId) {
      throw new BadRequestException('Source wallet has no node account');
    }
    const toWallet = await this.prisma.wallet.findFirst({
      where: { id: toWalletId },
    });
    if (!toWallet) {
      throw new NotFoundException('Destination wallet not found');
    }
    if (!toWallet.nodeAccountId) {
      throw new BadRequestException('Destination wallet has no node account');
    }
    if (this.useCantonSdk()) {
      return this.cantonWallet.transfer(fromWalletId, toWalletId, amount);
    }
    const result = await this.nodeApi.transfer(
      fromWallet.nodeAccountId,
      toWallet.nodeAccountId,
      String(amount),
    );
    return {
      success: result.success,
      transactionId: result.transactionId,
    };
  }
}

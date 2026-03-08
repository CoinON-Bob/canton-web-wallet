import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CantonService } from '../canton/canton.service';
import { WalletKeystoresService } from '../wallet-keystores/wallet-keystores.service';

const DEFAULT_INSTRUMENT_ID = 'Amulet';

@Injectable()
export class CantonWalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly canton: CantonService,
    private readonly keystores: WalletKeystoresService,
    private readonly config: ConfigService,
  ) {}

  private get instrumentId(): string {
    return this.config.get<string>('CANTON_DEFAULT_INSTRUMENT', DEFAULT_INSTRUMENT_ID);
  }

  async create(userId: string, label?: string): Promise<{
    id: string;
    userId: string;
    label: string | null;
    nodeAccountId: string | null;
    partyId: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const { partyId, privateKey } = await this.canton.createWalletWithKey();
    const wallet = await this.prisma.wallet.create({
      data: {
        id: randomUUID(),
        userId,
        label: label ?? null,
        nodeAccountId: partyId,
      },
    });
    await this.keystores.setCantonPrivateKey(wallet.id, privateKey);
    return {
      id: wallet.id,
      userId: wallet.userId,
      label: wallet.label,
      nodeAccountId: wallet.nodeAccountId,
      partyId,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async getBalance(partyId: string): Promise<string> {
    const sdk = await this.canton.getSdk();
    const tokenStandard = sdk.tokenStandard;
    if (!tokenStandard) {
      throw new Error('Canton token standard not available');
    }
    tokenStandard.setPartyId(partyId as never);
    const utxos = await tokenStandard.listHoldingUtxos(true, 500, undefined, partyId as never);
    let total = 0;
    for (const c of utxos) {
      const view = (c as { view?: { amount?: string; instrumentId?: string } }).view;
      if (view && (!view.instrumentId || String(view.instrumentId).includes(this.instrumentId))) {
        const amt = parseFloat(view.amount ?? '0');
        if (!Number.isNaN(amt)) total += amt;
      }
    }
    return String(total);
  }

  async transfer(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
  ): Promise<{ success: boolean; transactionId?: string }> {
    const fromWallet = await this.prisma.wallet.findFirst({
      where: { id: fromWalletId },
    });
    const toWallet = await this.prisma.wallet.findFirst({
      where: { id: toWalletId },
    });
    if (!fromWallet?.nodeAccountId || !toWallet?.nodeAccountId) {
      throw new BadRequestException('Wallet or party not found');
    }
    const fromPartyId = fromWallet.nodeAccountId;
    const toPartyId = toWallet.nodeAccountId;
    const privateKey = await this.keystores.getCantonPrivateKey(fromWalletId);

    const sdk = await this.canton.getSdk();
    const tokenStandard = sdk.tokenStandard;
    const ledger = sdk.userLedger;
    if (!tokenStandard || !ledger) {
      throw new Error('Canton token standard or ledger not available');
    }

    tokenStandard.setPartyId(fromPartyId as never);
    const [cmd, disclosed] = await tokenStandard.createTransfer(
      fromPartyId as never,
      toPartyId as never,
      String(amount),
      { instrumentId: this.instrumentId },
    );
    const commandId = randomUUID();
    const submissionId = await ledger
      .setPartyId(fromPartyId as never)
      .prepareSignAndExecuteTransaction(
        cmd as never,
        privateKey as never,
        commandId,
        disclosed as never,
      );
    return { success: true, transactionId: submissionId };
  }
}

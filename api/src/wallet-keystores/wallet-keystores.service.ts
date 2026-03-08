import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt, decrypt } from './keystore-crypto';

const CANTON_KEY_ID = 'canton-signing-key';

@Injectable()
export class WalletKeystoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getKeyEncryptionKey(): string {
    const key = this.config.get<string>('KEY_ENCRYPTION_KEY');
    if (!key || key.length !== 64) {
      throw new Error('KEY_ENCRYPTION_KEY must be set and 64 hex characters when using Canton SDK');
    }
    return key;
  }

  async setCantonPrivateKey(walletId: string, privateKey: string): Promise<void> {
    const keyHex = this.getKeyEncryptionKey();
    const encrypted = encrypt(privateKey, keyHex);
    await this.prisma.walletKeystore.upsert({
      where: {
        walletId_keyId: { walletId, keyId: CANTON_KEY_ID },
      },
      create: {
        walletId,
        keyId: CANTON_KEY_ID,
        encryptedPayload: encrypted,
      },
      update: { encryptedPayload: encrypted },
    });
  }

  async getCantonPrivateKey(walletId: string): Promise<string> {
    const keyHex = this.getKeyEncryptionKey();
    const row = await this.prisma.walletKeystore.findUnique({
      where: { walletId_keyId: { walletId, keyId: CANTON_KEY_ID } },
    });
    if (!row) {
      throw new Error('Wallet keystore not found');
    }
    return decrypt(row.encryptedPayload, keyHex);
  }
}

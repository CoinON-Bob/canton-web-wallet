import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  WalletSDKImpl,
  createKeyPair,
  signTransactionHash,
  localNetAuthDefault,
  localNetLedgerDefault,
  localNetTokenStandardDefault,
  localNetStaticConfig,
  TopologyController,
} from '@canton-network/wallet-sdk';
import type { WalletSDK } from '@canton-network/wallet-sdk';

const PARTY_HINT_PREFIX = 'canton-web-wallet';

@Injectable()
export class CantonService implements OnModuleInit {
  private readonly logger = new Logger(CantonService.name);
  private sdk: WalletSDK | null = null;
  private connectPromise: Promise<WalletSDK> | null = null;

  async onModuleInit(): Promise<void> {
    // Lazy connect on first use; do not connect in onModuleInit to avoid failing startup when Canton is not running.
  }

  /**
   * Connect to Canton ledger and topology. Uses LocalNet defaults (localhost) unless overridden by env.
   */
  async connectToCanton(): Promise<WalletSDK> {
    if (this.sdk) {
      return this.sdk;
    }
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.doConnect();
    try {
      this.sdk = await this.connectPromise;
      return this.sdk;
    } finally {
      this.connectPromise = null;
    }
  }

  private async doConnect(): Promise<WalletSDK> {
    const logger = {
      info: (msg: string, ...args: unknown[]) => this.logger.log(msg, ...args),
      warn: (msg: string, ...args: unknown[]) => this.logger.warn(msg, ...args),
      error: (msg: string, ...args: unknown[]) => this.logger.error(msg, ...args),
      debug: (msg: string, ...args: unknown[]) => this.logger.debug?.(msg, ...args),
      child: () => logger,
    };

    const sdk = new WalletSDKImpl().configure({
      logger,
      authFactory: () => localNetAuthDefault(logger as never),
      ledgerFactory: localNetLedgerDefault,
      tokenStandardFactory: localNetTokenStandardDefault,
    });

    await sdk.connect();
    this.logger.log('Connected to Canton ledger');

    await sdk.connectTopology(localNetStaticConfig.LOCALNET_SCAN_PROXY_API_URL);
    this.logger.log('Connected to Canton topology');

    return sdk;
  }

  /**
   * Generate fingerprint from public key (for display or pre-computed party ID).
   */
  getFingerprint(publicKey: string): string {
    return TopologyController.createFingerprintFromPublicKey(publicKey);
  }

  /**
   * Step 1: Generate topology transactions for an external party (prepare).
   */
  async createExternalParty(
    publicKey: string,
    partyHint?: string,
  ): Promise<{
    multiHash: string;
    partyId: string;
    publicKeyFingerprint: string;
    topologyTransactions: unknown[];
  }> {
    const sdk = await this.connectToCanton();
    const ledger = sdk.userLedger;
    if (!ledger) {
      throw new Error('Canton user ledger not available');
    }

    const hint = partyHint ?? `${PARTY_HINT_PREFIX}-${Date.now()}`;
    const prepared = await ledger.generateExternalParty(publicKey, hint);
    if (!prepared) {
      throw new Error('Failed to generate external party');
    }

    const multiHash = (prepared as { multiHash?: string }).multiHash;
    if (!multiHash) {
      throw new Error('GenerateExternalParty response missing multiHash');
    }

    return {
      multiHash,
      partyId: (prepared as { partyId?: string }).partyId ?? '',
      publicKeyFingerprint: (prepared as { publicKeyFingerprint?: string }).publicKeyFingerprint ?? '',
      topologyTransactions: (prepared as { topologyTransactions?: unknown[] }).topologyTransactions ?? [],
    };
  }

  /**
   * Step 2: Submit signed topology to allocate the external party on the ledger.
   */
  async allocateExternalParty(
    signedHash: string,
    preparedParty: {
      partyId: string;
      publicKeyFingerprint: string;
      topologyTransactions: unknown[];
      multiHash?: string;
    },
  ): Promise<{ partyId: string }> {
    const sdk = await this.connectToCanton();
    const ledger = sdk.userLedger;
    if (!ledger) {
      throw new Error('Canton user ledger not available');
    }

    const result = await ledger.allocateExternalParty(signedHash, preparedParty as never);
    return { partyId: result.partyId };
  }

  /**
   * Full flow: create keypair -> generateExternalParty -> sign -> allocateExternalParty.
   * Returns partyId, publicKey, and privateKey (caller must store privateKey encrypted).
   */
  async createWalletWithKey(): Promise<{
    partyId: string;
    publicKey: string;
    privateKey: string;
  }> {
    const keyPair = createKeyPair();
    this.logger.debug(`Fingerprint: ${this.getFingerprint(keyPair.publicKey)}`);

    const prepared = await this.createExternalParty(keyPair.publicKey);
    const signedHash = signTransactionHash(prepared.multiHash, keyPair.privateKey);
    const allocated = await this.allocateExternalParty(signedHash, prepared);

    return {
      partyId: allocated.partyId,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
    };
  }

  /**
   * Legacy: create wallet without returning private key (for /canton/create-wallet API).
   */
  async createWallet(): Promise<{ partyId: string; publicKey: string }> {
    const { partyId, publicKey } = await this.createWalletWithKey();
    return { partyId, publicKey };
  }

  /** Expose connected SDK for token standard and ledger (balance, transfer). */
  async getSdk(): Promise<WalletSDK> {
    return this.connectToCanton();
  }

  /**
   * Get party by ID: checks that the party exists and the connected user has access (via listWallets).
   */
  async getParty(partyId: string): Promise<{ partyId: string } | null> {
    const sdk = await this.connectToCanton();
    const ledger = sdk.userLedger;
    if (!ledger) {
      throw new Error('Canton user ledger not available');
    }

    const parties = await ledger.listWallets();
    const exists = parties.some((p) => String(p) === partyId);
    if (!exists) {
      return null;
    }
    return { partyId };
  }
}

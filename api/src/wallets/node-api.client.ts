import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface NodeAccount {
  id: string;
  partyId: string;
  balance?: string;
}

export interface NodeCreateAccountResponse {
  id: string;
  partyId: string;
}

export interface NodeTransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  currency?: string;
}

export interface NodeTransferResponse {
  success: boolean;
  transactionId?: string;
}

@Injectable()
export class NodeApiClient {
  constructor(private readonly config: ConfigService) {}

  private getBaseUrl(): string {
    return this.config.get<string>('NODE_API_BASE_URL', 'http://node-api.local');
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.getBaseUrl().replace(/\/$/, '')}${path}`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Node API ${method} ${path}: ${res.status} ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async createAccount(label?: string): Promise<NodeCreateAccountResponse> {
    return this.request<NodeCreateAccountResponse>('POST', '/accounts', {
      label: label ?? undefined,
    });
  }

  async getAccount(accountId: string): Promise<NodeAccount> {
    return this.request<NodeAccount>(
      'GET',
      `/accounts/${encodeURIComponent(accountId)}`,
    );
  }

  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: string,
    currency?: string,
  ): Promise<NodeTransferResponse> {
    return this.request<NodeTransferResponse>('POST', '/transfers', {
      fromAccountId,
      toAccountId,
      amount,
      currency,
    });
  }
}

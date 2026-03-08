/**
 * Wallet API client. Uses localStorage key `canton_access_token` for JWT.
 * Set VITE_API_BASE_URL in .env for API base (default http://localhost:3000).
 */

export const getApiBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE_URL) {
    return (import.meta as { env: Record<string, string> }).env.VITE_API_BASE_URL;
  }
  return 'http://localhost:3000';
};

const getBaseUrl = getApiBaseUrl;

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('canton_access_token');
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${getBaseUrl().replace(/\/$/, '')}${path}`;
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path}: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface WalletItem {
  id: string;
  userId: string;
  label: string | null;
  nodeAccountId: string | null;
  balance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletDetail extends WalletItem {
  partyId?: string;
}

export interface CreateWalletResponse {
  id: string;
  userId: string;
  label: string | null;
  nodeAccountId: string | null;
  partyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferResponse {
  success: boolean;
  transactionId?: string;
}

const base = () => getBaseUrl().replace(/\/$/, '');

export const authApi = {
  register: (email: string, password: string) =>
    fetch(`${base()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
  login: (email: string, password: string) =>
    fetch(`${base()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
};

export const usersApi = {
  getMe: () => request<{ id: string; email: string; emailVerified: boolean; createdAt: string; updatedAt: string }>('GET', '/users/me'),
};

export const emailVerificationApi = {
  send: (email: string) =>
    fetch(`${base()}/email-verifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
  verify: (email: string, code: string) =>
    fetch(`${base()}/email-verifications/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    }).then((r) => r.json().then((d) => ({ ok: r.ok, data: d }))),
};

export const walletApi = {
  create: (label?: string) =>
    request<CreateWalletResponse>('POST', '/wallets/create', { label }),

  list: () => request<WalletItem[]>('GET', '/wallets'),

  get: (id: string) => request<WalletDetail>('GET', `/wallets/${encodeURIComponent(id)}`),

  transfer: (fromWalletId: string, toWalletId: string, amount: number) =>
    request<TransferResponse>('POST', '/wallets/transfer', {
      fromWalletId,
      toWalletId,
      amount,
    }),
};

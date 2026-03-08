// ==================== 用户类型 ====================

export interface User {
  id?: string;
  email: string;
  emailVerified?: boolean;
  isAuthenticated: boolean;
  walletAddress?: string;
}

// ==================== Token 类型 ====================

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  valueUSD: string;
  change24h: string;
  icon: string;
  price: number;
  decimals: number;
  chain?: string;
  contractAddress?: string;
}

// ==================== 交易类型 ====================

export type TransactionStatus = 
  | 'Created' 
  | 'Signing' 
  | 'Broadcasted' 
  | 'Confirmed' 
  | 'Failed' 
  | 'Pending';

export type TransactionType = 'Send' | 'Receive' | 'Swap' | 'Batch' | 'Offer';

export interface Transaction {
  id: string;
  type: TransactionType;
  hash: string;
  amount: string;
  token: string;
  status: TransactionStatus;
  from: string;
  to: string;
  fee: string;
  timestamp: string;
  description?: string;
  gasPrice?: string;
  gasLimit?: string;
  nonce?: number;
}

// ==================== Offer 类型 ====================

export interface Offer {
  id: string;
  from: string;
  to?: string;
  amount: string;
  token: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  description?: string;
}

// ==================== 批量转账类型 ====================

export interface BatchRecipient {
  address: string;
  amount: string;
  status: 'pending' | 'success' | 'failed';
  txHash?: string;
  error?: string;
}

export interface BatchTransfer {
  id: string;
  name: string;
  total: number;
  success: number;
  failed: number;
  status: 'Created' | 'Validating' | 'Processing' | 'Partial Failed' | 'Completed';
  createdAt: string;
  completedAt?: string;
  token: string;
  recipients: BatchRecipient[];
  totalAmount: string;
  gasEstimate?: string;
}

// ==================== 通知类型 ====================

export interface Notification {
  id: string;
  type: 'transaction' | 'offer' | 'system' | 'batch';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

// ==================== Gas 费用类型 ====================

export interface GasEstimate {
  slow: {
    price: string;
    time: string;
    usd: string;
  };
  standard: {
    price: string;
    time: string;
    usd: string;
  };
  fast: {
    price: string;
    time: string;
    usd: string;
  };
}

// ==================== 路由类型 ====================

export type PageRoute = 
  | 'dashboard' 
  | 'assets' 
  | 'send' 
  | 'swap' 
  | 'batch' 
  | 'offers' 
  | 'activity' 
  | 'settings';

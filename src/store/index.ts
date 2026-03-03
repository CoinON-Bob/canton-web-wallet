import { create } from 'zustand';
import type {
  User,
  Token,
  Transaction,
  TransactionStatus,
  Offer,
  BatchTransfer,
  Notification,
  PageRoute
} from '../types';

// ==================== 初始数据 ====================

const initialTokens: Token[] = [
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    balance: '2.5', 
    valueUSD: '8,500.00', 
    change24h: '+2.5%', 
    icon: '◆', 
    price: 3400,
    decimals: 18,
    chain: 'ethereum'
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    balance: '15,000.00', 
    valueUSD: '15,000.00', 
    change24h: '+0.1%', 
    icon: '$', 
    price: 1,
    decimals: 6,
    chain: 'ethereum'
  },
  { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    balance: '0.15', 
    valueUSD: '10,500.00', 
    change24h: '+1.8%', 
    icon: '₿', 
    price: 70000,
    decimals: 8,
    chain: 'bitcoin'
  },
  { 
    symbol: 'MATIC', 
    name: 'Polygon', 
    balance: '5,000.00', 
    valueUSD: '3,500.00', 
    change24h: '-0.5%', 
    icon: '⬡', 
    price: 0.7,
    decimals: 18,
    chain: 'polygon'
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 'tx1',
    type: 'Send',
    hash: '0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    amount: '1.5',
    token: 'ETH',
    status: 'Confirmed',
    from: '0xabcd1234efgh5678ijkl9012mnop3456',
    to: '0x9876fedcba543210hgfeijkl9876mnop',
    fee: '0.0021 ETH',
    timestamp: '2024-03-02T14:30:00Z',
    description: 'Transfer to institutional partner'
  },
  {
    id: 'tx2',
    type: 'Receive',
    hash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    amount: '5,000',
    token: 'USDC',
    status: 'Confirmed',
    from: '0x1111222233334444555566667777888899990000',
    to: '0xabcd1234efgh5678ijkl9012mnop3456',
    fee: '0.0015 ETH',
    timestamp: '2024-03-02T13:15:00Z',
    description: 'Payment from client'
  },
  {
    id: 'tx3',
    type: 'Swap',
    hash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    amount: '0.05',
    token: 'BTC',
    status: 'Confirmed',
    from: '0xabcd1234efgh5678ijkl9012mnop3456',
    to: '0xswapuniswapv30000000000000000000000',
    fee: '0.0018 ETH',
    timestamp: '2024-03-01T09:45:00Z',
    description: 'ETH → BTC swap'
  },
  {
    id: 'tx4',
    type: 'Batch',
    hash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    amount: '50',
    token: 'USDC',
    status: 'Confirmed',
    from: '0xabcd1234efgh5678ijkl9012mnop3456',
    to: '0xbatch00000000000000000000000000000',
    fee: '0.025 ETH',
    timestamp: '2024-02-28T16:20:00Z',
    description: 'Monthly salary distribution'
  },
  {
    id: 'tx5',
    type: 'Send',
    hash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    amount: '100',
    token: 'MATIC',
    status: 'Pending',
    from: '0xabcd1234efgh5678ijkl9012mnop3456',
    to: '0xpayrollcontract000000000000000000',
    fee: '0.0012 ETH',
    timestamp: '2024-03-02T15:00:00Z',
    description: 'Gas fee reimbursement'
  },
];

const initialOffers: Offer[] = [
  {
    id: 'offer1',
    from: '0x7890abcd1234efgh5678ijkl9012mnop',
    amount: '2,500',
    token: 'USDC',
    expiresAt: '2024-03-03T12:00:00Z',
    status: 'pending',
    createdAt: '2024-03-02T10:00:00Z',
    description: 'Invoice #1234 payment'
  },
  {
    id: 'offer2',
    from: '0x5678efgh9012ijkl3456mnop7890abcd',
    amount: '0.8',
    token: 'ETH',
    expiresAt: '2024-03-02T18:00:00Z',
    status: 'pending',
    createdAt: '2024-03-02T08:00:00Z',
    description: 'Consulting fee'
  },
];

const initialBatches: BatchTransfer[] = [
  {
    id: 'batch1',
    name: 'March Salary Distribution',
    total: 50,
    success: 48,
    failed: 2,
    status: 'Completed',
    createdAt: '2024-03-01T09:00:00Z',
    completedAt: '2024-03-01T09:15:00Z',
    token: 'USDC',
    totalAmount: '125,000',
    recipients: []
  },
  {
    id: 'batch2',
    name: 'Community Airdrop Campaign',
    total: 1000,
    success: 450,
    failed: 0,
    status: 'Processing',
    createdAt: '2024-03-02T10:00:00Z',
    token: 'MATIC',
    totalAmount: '50,000',
    recipients: []
  },
  {
    id: 'batch3',
    name: 'Partner Rewards Q1',
    total: 25,
    success: 20,
    failed: 5,
    status: 'Partial Failed',
    createdAt: '2024-02-15T14:30:00Z',
    completedAt: '2024-02-15T14:45:00Z',
    token: 'ETH',
    totalAmount: '12.5',
    recipients: []
  }
];

const initialNotifications: Notification[] = [
  {
    id: 'notif1',
    type: 'transaction',
    title: 'Transaction Confirmed',
    message: 'Your transfer of 1.5 ETH has been confirmed',
    timestamp: '2024-03-02T14:32:00Z',
    read: false,
    link: '/activity'
  },
  {
    id: 'notif2',
    type: 'offer',
    title: 'New Offer Received',
    message: 'You received an offer for 2,500 USDC',
    timestamp: '2024-03-02T10:05:00Z',
    read: false,
    link: '/offers'
  },
  {
    id: 'notif3',
    type: 'batch',
    title: 'Batch Transfer Completed',
    message: 'March Salary Distribution completed with 48/50 successful',
    timestamp: '2024-03-01T09:15:00Z',
    read: true,
    link: '/batch'
  }
];

// ==================== Store 接口 ====================

interface WalletState {
  // State
  user: User | null;
  tokens: Token[];
  transactions: Transaction[];
  offers: Offer[];
  batchTransfers: BatchTransfer[];
  notifications: Notification[];
  isLoading: boolean;
  currentPage: PageRoute;
  hideBalance: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  addToken: (token: Token) => void;
  updateTokenBalance: (symbol: string, balance: string) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransactionStatus: (id: string, status: TransactionStatus) => void;
  addOffer: (offer: Offer) => void;
  updateOfferStatus: (id: string, status: Offer['status']) => void;
  addBatchTransfer: (batch: BatchTransfer) => void;
  updateBatchStatus: (id: string, status: BatchTransfer['status']) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentPage: (page: PageRoute) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleHideBalance: () => void;
}

// ==================== localStorage 辅助函数 ====================

const getInitialHideBalance = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('canton-wallet-hide-balance');
    return saved === 'true';
  }
  return false;
};

// ==================== Store 实现 ====================

export const useWalletStore = create<WalletState>((set) => ({
  // Initial state
  user: null,
  tokens: initialTokens,
  transactions: initialTransactions,
  offers: initialOffers,
  batchTransfers: initialBatches,
  notifications: initialNotifications,
  isLoading: false,
  currentPage: 'dashboard',
  hideBalance: getInitialHideBalance(),
  
  // Actions
  setUser: (user) => set({ user }),
  
  addToken: (token) => set((state) => ({ 
    tokens: [...state.tokens, token] 
  })),
  
  updateTokenBalance: (symbol, balance) => set((state) => ({
    tokens: state.tokens.map(t => 
      t.symbol === symbol ? { ...t, balance } : t
    )
  })),
  
  addTransaction: (tx) => set((state) => ({
    transactions: [tx, ...state.transactions]
  })),
  
  updateTransactionStatus: (id, status) => set((state) => ({
    transactions: state.transactions.map(tx =>
      tx.id === id ? { ...tx, status } : tx
    )
  })),
  
  addOffer: (offer) => set((state) => ({
    offers: [...state.offers, offer]
  })),
  
  updateOfferStatus: (id, status) => set((state) => ({
    offers: state.offers.map(o =>
      o.id === id ? { ...o, status } : o
    )
  })),
  
  addBatchTransfer: (batch) => set((state) => ({
    batchTransfers: [...state.batchTransfers, batch]
  })),
  
  updateBatchStatus: (id, status) => set((state) => ({
    batchTransfers: state.batchTransfers.map(b =>
      b.id === id ? { ...b, status } : b
    )
  })),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [{
      ...notification,
      id: `notif${Date.now()}`,
      timestamp: new Date().toISOString()
    }, ...state.notifications]
  })),
  
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
  })),
  
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  
  toggleHideBalance: () => set((state) => {
    const newValue = !state.hideBalance;
    localStorage.setItem('canton-wallet-hide-balance', String(newValue));
    return { hideBalance: newValue };
  })
}));

// ==================== 导出类型 ====================

export * from '../types';

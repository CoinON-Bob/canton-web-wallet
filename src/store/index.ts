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
// ==================== 合约类型 ====================

export interface ContractOrder {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  amount: string;
  price: string;
  leverage: number;
  status: 'Filled' | 'Open' | 'Cancelled';
  timestamp: string;
  value: string;
}

export interface ContractPosition {
  id: string;
  pair: string;
  side: 'long' | 'short';
  size: string;
  entryPrice: string;
  currentPrice: string;
  unrealizedPnl: string;
  margin: string;
  leverage: number;
  timestamp: string;
}

// ==================== 初始数据 ====================

const initialTokens: Token[] = [
  { 
    symbol: 'CC', 
    name: 'Canton', 
    balance: '0', 
    valueUSD: '0', 
    change24h: '0%', 
    icon: 'C', 
    price: 0,
    decimals: 8,
    chain: 'canton'
  },
  { 
    symbol: 'USDC', 
    name: 'USD Coin', 
    balance: '0', 
    valueUSD: '0', 
    change24h: '0%', 
    icon: '$', 
    price: 1,
    decimals: 6,
    chain: 'canton'
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 'tx1',
    type: 'Send',
    hash: 'mock-tx-1',
    amount: '0',
    token: 'CC',
    status: 'Confirmed',
    from: 'Mock Wallet',
    to: 'Mock Wallet',
    fee: '0 CC',
    timestamp: new Date().toISOString(),
    description: 'Canton transfer (mock)'
  },
];

const initialOffers: Offer[] = [
  {
    id: 'offer1',
    from: 'Mock Wallet',
    amount: '0',
    token: 'USDC',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    description: 'Canton offer (mock)'
  },
];

const initialBatches: BatchTransfer[] = [
  {
    id: 'batch1',
    name: 'Canton Batch (mock)',
    total: 0,
    success: 0,
    failed: 0,
    status: 'Completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    token: 'USDC',
    totalAmount: '0',
    recipients: []
  },
  {
    id: 'batch2',
    name: 'Canton Batch (mock)',
    total: 0,
    success: 0,
    failed: 0,
    status: 'Processing',
    createdAt: new Date().toISOString(),
    token: 'CC',
    totalAmount: '0',
    recipients: []
  },
  {
    id: 'batch3',
    name: 'Partner Rewards (mock)',
    total: 0,
    success: 0,
    failed: 0,
    status: 'Completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    token: 'CC',
    totalAmount: '0',
    recipients: []
  }
];

const initialContractOrders: ContractOrder[] = [
  { id: 'co1', pair: 'CC/BTC', side: 'buy', amount: '1,000', price: '1.2540', leverage: 10, status: 'Filled', timestamp: new Date(Date.now() - 3600000).toISOString(), value: '$1,254' },
  { id: 'co2', pair: 'CC/BTC', side: 'sell', amount: '500', price: '1.3010', leverage: 5, status: 'Open', timestamp: new Date(Date.now() - 7200000).toISOString(), value: '$650' },
  { id: 'co3', pair: 'CC/USDC', side: 'buy', amount: '2,000', price: '1.00', leverage: 20, status: 'Cancelled', timestamp: new Date(Date.now() - 10800000).toISOString(), value: '$2,000' },
];

const initialContractPositions: ContractPosition[] = [
  { id: 'cp1', pair: 'CC/BTC', side: 'long', size: '5,000 CC', entryPrice: '1.2100', currentPrice: '1.2540', unrealizedPnl: '+$220', margin: '$610', leverage: 10, timestamp: new Date(Date.now() - 86400000).toISOString() },
];

const initialNotifications: Notification[] = [
  {
    id: 'notif1',
    type: 'transaction',
    title: 'Transaction Confirmed',
    message: 'Your Canton transfer has been confirmed (mock)',
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
  theme: 'dark' | 'light';
  contractOrders: ContractOrder[];
  contractPositions: ContractPosition[];

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
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  addContractOrder: (order: ContractOrder) => void;
  addContractPosition: (position: ContractPosition) => void;
  closeContractPosition: (id: string) => void;
}

// ==================== localStorage 辅助函数 ====================

const getInitialHideBalance = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('canton-wallet-hide-balance');
    return saved === 'true';
  }
  return false;
};

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('canton-wallet-theme');
    // 有保存就用，否则默认 dark（不跟随系统）
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  }
  return 'dark';
};

// ==================== Theme 应用函数 ====================

export const applyTheme = (theme: 'dark' | 'light') => {
  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('canton-wallet-theme', theme);
  }
};

// ==================== Store 实现 ====================

export const useWalletStore = create<WalletState>((set) => ({
  // Initial state - 默认未登录
  user: null,
  tokens: initialTokens,
  transactions: initialTransactions,
  offers: initialOffers,
  batchTransfers: initialBatches,
  notifications: initialNotifications,
  isLoading: false,
  currentPage: 'dashboard',
  hideBalance: getInitialHideBalance(),
  theme: getInitialTheme(),
  contractOrders: initialContractOrders,
  contractPositions: initialContractPositions,
  
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
  }),
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    return { theme: newTheme };
  }),
  
  setTheme: (theme) => set(() => {
    applyTheme(theme);
    return { theme };
  }),

  addContractOrder: (order) => set((state) => ({
    contractOrders: [order, ...state.contractOrders],
  })),

  addContractPosition: (position) => set((state) => ({
    contractPositions: [position, ...state.contractPositions],
  })),

  closeContractPosition: (id) => set((state) => ({
    contractPositions: state.contractPositions.filter(p => p.id !== id),
  })),
}));

// ==================== 导出类型 ====================

export * from '../types';

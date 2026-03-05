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
import { MOCK_CANTON_ADDRESS, MOCK_CONTACTS, MOCK_TRANSACTION_PARTIES } from '../config/canton';

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

const initialUser: User = {
  email: 'user@canton.network',
  walletAddress: MOCK_CANTON_ADDRESS,
  isAuthenticated: true,
};

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
    hash: 'CANTON::TX1A2B3C4D5E6F7G8',
    amount: '1.5',
    token: 'ETH',
    status: 'Confirmed',
    from: MOCK_CANTON_ADDRESS,
    to: MOCK_CONTACTS.INSTITUTIONAL_PARTNER,
    fee: '0.0021 ETH',
    timestamp: '2024-03-02T14:30:00Z',
    description: 'Transfer to institutional partner'
  },
  {
    id: 'tx2',
    type: 'Receive',
    hash: 'CANTON::TX2B3C4D5E6F7G8H9',
    amount: '5,000',
    token: 'USDC',
    status: 'Confirmed',
    from: MOCK_CONTACTS.CLIENT_A,
    to: MOCK_CANTON_ADDRESS,
    fee: '0.0015 ETH',
    timestamp: '2024-03-02T13:15:00Z',
    description: 'Payment from client'
  },
  {
    id: 'tx3',
    type: 'Swap',
    hash: 'CANTON::TX3C4D5E6F7G8H9J0',
    amount: '0.05',
    token: 'BTC',
    status: 'Confirmed',
    from: MOCK_CANTON_ADDRESS,
    to: MOCK_TRANSACTION_PARTIES[0],
    fee: '0.0018 ETH',
    timestamp: '2024-03-01T09:45:00Z',
    description: 'ETH → BTC swap'
  },
  {
    id: 'tx4',
    type: 'Batch',
    hash: 'CANTON::TX4D5E6F7G8H9J1K2',
    amount: '50',
    token: 'USDC',
    status: 'Confirmed',
    from: MOCK_CANTON_ADDRESS,
    to: MOCK_TRANSACTION_PARTIES[1],
    fee: '0.025 ETH',
    timestamp: '2024-02-28T16:20:00Z',
    description: 'Monthly salary distribution'
  },
  {
    id: 'tx5',
    type: 'Send',
    hash: 'CANTON::TX5E6F7G8H9J1K2L3',
    amount: '100',
    token: 'MATIC',
    status: 'Pending',
    from: MOCK_CANTON_ADDRESS,
    to: MOCK_TRANSACTION_PARTIES[2],
    fee: '0.0012 ETH',
    timestamp: '2024-03-02T15:00:00Z',
    description: 'Gas fee reimbursement'
  },
];

const initialOffers: Offer[] = [
  {
    id: 'offer1',
    from: 'CANTONclientAA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
    amount: '2,500',
    token: 'USDC',
    expiresAt: '2024-03-03T12:00:00Z',
    status: 'pending',
    createdAt: '2024-03-02T10:00:00Z',
    description: 'Invoice #1234 payment'
  },
  {
    id: 'offer2',
    from: MOCK_CONTACTS.CLIENT_B,
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

const initialContractOrders: ContractOrder[] = [
  { id: 'co1', pair: 'CC/BTC', side: 'buy', amount: '1,000', price: '1.2540', leverage: 10, status: 'Filled', timestamp: new Date(Date.now() - 3600000).toISOString(), value: '$1,254' },
  { id: 'co2', pair: 'CC/BTC', side: 'sell', amount: '500', price: '1.3010', leverage: 5, status: 'Open', timestamp: new Date(Date.now() - 7200000).toISOString(), value: '$650' },
  { id: 'co3', pair: 'ETH/USDC', side: 'buy', amount: '2,000', price: '3,380.00', leverage: 20, status: 'Cancelled', timestamp: new Date(Date.now() - 10800000).toISOString(), value: '$2,440' },
];

const initialContractPositions: ContractPosition[] = [
  { id: 'cp1', pair: 'CC/BTC', side: 'long', size: '5,000 CC', entryPrice: '1.2100', currentPrice: '1.2540', unrealizedPnl: '+$220', margin: '$610', leverage: 10, timestamp: new Date(Date.now() - 86400000).toISOString() },
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

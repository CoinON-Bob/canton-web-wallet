// ==================== Canton Network Mock 配置 ====================
// 阶段1：使用 mock 数据替换全站 EVM 地址
// 阶段2：接入真实 Canton SDK 后替换为真实地址

import { generateMockCantonAddress } from '../utils/address';

// 当前用户钱包地址（mock）
export const MOCK_CANTON_ADDRESS = 'CANTONa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0';

// 常用联系人地址（mock）
export const MOCK_CONTACTS = {
  INSTITUTIONAL_PARTNER: 'CANTONpartner1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
  CLIENT_A: 'CANTONclientAA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
  CLIENT_B: 'CANTONclientBB1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
  EXCHANGE: 'CANTONexchange1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
};

// 交易对手地址（mock）
export const MOCK_TRANSACTION_PARTIES = [
  'CANTONparty1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2',
  'CANTONparty2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3',
  'CANTONparty3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4',
];

// Explorer 配置
export const CANTON_EXPLORER_CONFIG = {
  // 阶段1：占位或已知链接
  // TODO: 接入真实 Canton Explorer
  BASE_URL: 'https://explorer.canton.network',
  
  // 路由路径
  ADDRESS_PATH: '/address',
  TX_PATH: '/tx',
  
  // 是否可用（阶段1设为 false 隐藏入口）
  IS_AVAILABLE: false,
};

// Token 合约地址（mock - Canton 格式）
export const MOCK_TOKEN_CONTRACTS: Record<string, string> = {
  'ETH': 'CANTONeth1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
  'USDC': 'CANTONusdc1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0',
  'BTC': 'CANTONbtc1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
  'MATIC': 'CANTONmatic1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r',
};
// ==================== Canton Network 地址工具 ====================

/**
 * Canton Network 地址格式规范
 * - 不以 0x 开头
 * - 使用 Base58 或类似的编码格式
 * - 示例格式：CANTONabc123...xyz789
 */

const CANTON_ADDRESS_PREFIX = 'CANTON';
const CANTON_ADDRESS_LENGTH = 44; // 完整地址长度

/**
 * 格式化 Canton 地址（完整展示）
 * @param addr 原始地址
 * @returns 格式化后的地址
 */
export const formatCantonAddress = (addr: string): string => {
  if (!addr) return '';
  
  // 如果是 EVM 格式（0x开头），转换为 Canton 格式（mock 转换）
  if (addr.startsWith('0x')) {
    return convertEvmToCanton(addr);
  }
  
  return addr;
};

/**
 * 缩短地址显示
 * @param addr 完整地址
 * @param head 头部保留字符数
 * @param tail 尾部保留字符数
 * @returns 缩短后的地址，如 CANTON...x8y9z
 */
export const shortAddress = (addr: string, head = 10, tail = 4): string => {
  if (!addr) return '';
  if (addr.length <= head + tail + 3) return addr;
  
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
};

/**
 * 验证 Canton 地址格式
 * @param addr 待验证地址
 * @returns 是否有效
 */
export const validateCantonAddress = (addr: string): boolean => {
  if (!addr || typeof addr !== 'string') return false;
  
  // 必须以 CANTON 开头
  if (!addr.startsWith(CANTON_ADDRESS_PREFIX)) return false;
  
  // 长度检查
  if (addr.length !== CANTON_ADDRESS_LENGTH) return false;
  
  // 字符集检查（Base58 子集）
  const validChars = /^[A-HJ-NP-Za-km-z1-9]+$/;
  const body = addr.slice(CANTON_ADDRESS_PREFIX.length);
  
  return validChars.test(body);
};

/**
 * EVM 地址转换为 Canton 格式（mock 阶段）
 * @param evmAddr EVM 地址（0x...）
 * @returns Canton 格式地址
 */
const convertEvmToCanton = (evmAddr: string): string => {
  // 移除 0x 前缀
  const clean = evmAddr.slice(2).toUpperCase();
  
  // 生成 Canton 格式（mock 转换规则）
  // 实际项目应调用 Canton SDK 或后端 API
  const body = clean + generateChecksum(clean);
  
  // 截断或填充到固定长度
  const padded = body.padEnd(CANTON_ADDRESS_LENGTH - CANTON_ADDRESS_PREFIX.length, '0');
  const truncated = padded.slice(0, CANTON_ADDRESS_LENGTH - CANTON_ADDRESS_PREFIX.length);
  
  return CANTON_ADDRESS_PREFIX + truncated;
};

/**
 * 生成简单的校验字符（mock 阶段）
 */
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).slice(0, 4).toUpperCase();
};

/**
 * 获取 Canton Explorer 链接
 * @param addr 地址
 * @param type 类型：'address' | 'tx'
 * @returns Explorer URL
 */
export const getCantonExplorerUrl = (
  addr: string, 
  type: 'address' | 'tx' = 'address'
): string => {
  // 阶段1：使用占位链接或已知的 Canton Explorer
  // TODO: 接入真实的 Canton Explorer
  const baseUrl = 'https://explorer.canton.network';
  
  if (type === 'tx') {
    return `${baseUrl}/tx/${addr}`;
  }
  
  return `${baseUrl}/address/${addr}`;
};

/**
 * 生成 mock Canton 地址（用于开发和测试）
 * @returns 有效的 mock Canton 地址
 */
export const generateMockCantonAddress = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let body = '';
  
  // 生成随机字符
  for (let i = 0; i < CANTON_ADDRESS_LENGTH - CANTON_ADDRESS_PREFIX.length; i++) {
    body += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return CANTON_ADDRESS_PREFIX + body;
};
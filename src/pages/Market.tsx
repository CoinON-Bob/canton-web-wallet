import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  BarChart2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, PageTransition, PageHeader, useToast } from '../components/ui';

// ==================== Market Token 接口 ====================

interface MarketToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  icon: string;
  pinned?: boolean;
  lastUpdated: string;
}

// ==================== Mock API 服务 ====================

class MarketApiService {
  private static instance: MarketApiService;
  
  static getInstance(): MarketApiService {
    if (!MarketApiService.instance) {
      MarketApiService.instance = new MarketApiService();
    }
    return MarketApiService.instance;
  }
  
  // 模拟从 API 获取数据
  async fetchMarketData(): Promise<MarketToken[]> {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟当前时间
    const now = new Date();
    const timestamp = now.toISOString();
    
    // 模拟价格波动
    const randomFluctuation = () => (Math.random() - 0.5) * 0.1; // ±5%
    
    return [
      {
        symbol: 'CC',
        name: 'Canton Coin',
        price: 1.25 * (1 + randomFluctuation()),
        change24h: 5.23 + (Math.random() - 0.5) * 2,
        volume24h: 125000000 * (1 + Math.random() * 0.2),
        marketCap: 2500000000,
        high24h: 1.32,
        low24h: 1.18,
        icon: '◆',
        pinned: true,
        lastUpdated: timestamp,
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3456.78 * (1 + randomFluctuation()),
        change24h: -2.15 + (Math.random() - 0.5) * 2,
        volume24h: 15600000000 * (1 + Math.random() * 0.2),
        marketCap: 415000000000,
        high24h: 3520.00,
        low24h: 3380.50,
        icon: '◆',
        lastUpdated: timestamp,
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 67890.12 * (1 + randomFluctuation()),
        change24h: 1.85 + (Math.random() - 0.5) * 2,
        volume24h: 28900000000 * (1 + Math.random() * 0.2),
        marketCap: 1335000000000,
        high24h: 68500.00,
        low24h: 66500.00,
        icon: '₿',
        lastUpdated: timestamp,
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        price: 1.00,
        change24h: 0.02,
        volume24h: 8900000000,
        marketCap: 42000000000,
        high24h: 1.01,
        low24h: 0.99,
        icon: '$',
        lastUpdated: timestamp,
      },
      {
        symbol: 'MATIC',
        name: 'Polygon',
        price: 0.85 * (1 + randomFluctuation()),
        change24h: -5.67 + (Math.random() - 0.5) * 2,
        volume24h: 456000000 * (1 + Math.random() * 0.2),
        marketCap: 7800000000,
        high24h: 0.92,
        low24h: 0.82,
        icon: '⬡',
        lastUpdated: timestamp,
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        price: 145.32 * (1 + randomFluctuation()),
        change24h: 8.45 + (Math.random() - 0.5) * 2,
        volume24h: 2340000000 * (1 + Math.random() * 0.2),
        marketCap: 62000000000,
        high24h: 152.00,
        low24h: 138.50,
        icon: '◎',
        lastUpdated: timestamp,
      },
      {
        symbol: 'LINK',
        name: 'Chainlink',
        price: 18.76 * (1 + randomFluctuation()),
        change24h: -1.23 + (Math.random() - 0.5) * 2,
        volume24h: 345000000 * (1 + Math.random() * 0.2),
        marketCap: 10500000000,
        high24h: 19.50,
        low24h: 18.20,
        icon: '⬢',
        lastUpdated: timestamp,
      },
      {
        symbol: 'AAVE',
        name: 'Aave',
        price: 112.45 * (1 + randomFluctuation()),
        change24h: 3.21 + (Math.random() - 0.5) * 2,
        volume24h: 189000000 * (1 + Math.random() * 0.2),
        marketCap: 1650000000,
        high24h: 118.00,
        low24h: 108.50,
        icon: 'ⓐ',
        lastUpdated: timestamp,
      },
    ];
  }
  
  // 模拟刷新数据
  async refreshMarketData(): Promise<MarketToken[]> {
    return this.fetchMarketData();
  }
}

// ==================== Token 行组件 ====================

interface TokenRowProps {
  token: MarketToken;
  onClick: () => void;
}

const TokenRow: React.FC<TokenRowProps> = ({ token, onClick }) => {
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language === 'zh';
  const isPositive = token.change24h >= 0;

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(2)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const changeTag = (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
      isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
    }`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(token.change24h).toFixed(2)}%
    </span>
  );

  return (
    <motion.div
      whileHover={{ backgroundColor: 'var(--card-hover)' }}
      className="border-b border-[var(--border)] last:border-0 cursor-pointer group px-4"
      onClick={onClick}
    >
      {/* Mobile: 2-line card (≤ sm) */}
      <div className="sm:hidden py-3 flex items-center gap-3">
        <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold">{token.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[var(--text)] flex items-center gap-1">
              {token.symbol}
              {token.pinned && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
            </span>
            <span className="font-semibold text-[var(--text)] tabular-nums">{formatPrice(token.price)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span className="text-xs text-[var(--text-muted)] truncate">{token.name}</span>
            {changeTag}
          </div>
        </div>
      </div>

      {/* Desktop: full-column row (≥ sm) */}
      <div className="hidden sm:grid grid-cols-12 gap-4 py-4 items-center">
        <div className="col-span-4 lg:col-span-3 flex items-center gap-3">
          <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{token.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text)]">{token.symbol}</span>
              {token.pinned && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
            </div>
            <span className="text-sm text-[var(--text-muted)]">{token.name}</span>
          </div>
        </div>
        <div className="col-span-2 lg:col-span-2">
          <span className="font-semibold text-[var(--text)] tabular-nums">{formatPrice(token.price)}</span>
        </div>
        <div className="col-span-2 lg:col-span-2">{changeTag}</div>
        <div className="col-span-2 lg:col-span-2">
          <span className="text-[var(--text)] tabular-nums">{formatVolume(token.volume24h)}</span>
        </div>
        <div className="col-span-2 lg:col-span-3 flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">
            {t('market.details')}
          </span>
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
        </div>
      </div>
    </motion.div>
  );
};

// ==================== Market 页面 ====================

export const MarketPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [marketData, setMarketData] = useState<MarketToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const isChinese = i18n.language === 'zh';
  
  const marketApi = MarketApiService.getInstance();
  
  // 初始化加载数据
  useEffect(() => {
    loadMarketData();
  }, []);
  
  const loadMarketData = async () => {
    setIsLoading(true);
    try {
      const data = await marketApi.fetchMarketData();
      setMarketData(data);
      if (data.length > 0) {
        setLastUpdated(data[0].lastUpdated);
      }
      showToast(t('market.dataLoaded'), 'success');
    } catch (error) {
      console.error('Failed to load market data:', error);
      showToast(t('market.dataLoadFailed'), 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await marketApi.refreshMarketData();
      setMarketData(data);
      if (data.length > 0) {
        setLastUpdated(data[0].lastUpdated);
      }
      showToast(t('market.dataRefreshed'), 'success');
    } catch (error) {
      console.error('Failed to refresh market data:', error);
      showToast(t('market.dataRefreshFailed'), 'error');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleTokenClick = (token: MarketToken) => {
    navigate(`/market/${token.symbol.toLowerCase()}`);
  };
  
  // 过滤数据
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return marketData;
    
    const query = searchQuery.toLowerCase();
    return marketData.filter(token => 
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query)
    );
  }, [marketData, searchQuery]);
  
  // 排序数据：置顶的在前，然后按市值排序
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.marketCap - a.marketCap;
    });
  }, [filteredData]);
  
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <PageTransition className="min-h-screen">
      <PageHeader 
        title={t('market.title')} 
        subtitle={t('market.subtitle')} 
      />
      
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* 合约交易入口 */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => navigate('/contracts')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-2xl hover:from-blue-500/15 hover:to-purple-600/15 transition-all touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[var(--text)]">
                  {t('market.contractTrading')}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {t('contracts.pair')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-full">
                {t('market.contractTradingDemo')}
              </span>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
          </button>
        </motion.div>

        {/* 搜索和刷新栏 */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('market.searchPlaceholder')}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 pl-11 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] touch-manipulation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <div className="text-sm text-[var(--text-muted)] hidden md:block">
                    {t('market.lastUpdatedLabel')}: {formatTime(lastUpdated)}
                  </div>
                )}
                
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-600)] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="font-medium">
                    {isRefreshing ? t('market.refreshing') : t('market.refreshData')}
                  </span>
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* 市场数据表格 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--card)] flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-[var(--text-muted)] animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-2">
                  {t('market.loadingData')}
                </h3>
                <p className="text-[var(--text-muted)]">
                  {t('market.loadingDataDesc')}
                </p>
              </div>
            ) : sortedData.length > 0 ? (
              <>
                {/* 表格头部 */}
                <div className="hidden sm:block px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-[var(--text-muted)]">
                    <div className="col-span-4 lg:col-span-3">{t('market.colToken')}</div>
                    <div className="col-span-2 lg:col-span-2">{t('market.price')}</div>
                    <div className="col-span-2 lg:col-span-2">{t('market.colChange')}</div>
                    <div className="col-span-2 lg:col-span-2">{t('market.volume24h')}</div>
                    <div className="col-span-2 lg:col-span-3">{t('market.colAction')}</div>
                  </div>
                </div>
                
                {/* 列表内容 */}
                <div>
                  {sortedData.map((token) => (
                    <TokenRow
                      key={token.symbol}
                      token={token}
                      onClick={() => handleTokenClick(token)}
                    />
                  ))}
                </div>
                
                {/* 表格底部信息 */}
                <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--card)]">
                  <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                    <span>
                      {t('market.showingOf', { shown: Math.min(sortedData.length, 8), total: sortedData.length })}
                    </span>
                    <span>
                      {lastUpdated && `${t('market.dataUpdatedLabel')}: ${formatTime(lastUpdated)}`}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--card)] flex items-center justify-center">
                  <Search className="w-6 h-6 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-2">
                  {t('market.noResults')}
                </h3>
                <p className="text-[var(--text-muted)] max-w-md mx-auto">
                  {t('market.noResultsDesc')}
                </p>
              </div>
            )}
          </Card>
        </motion.div>
        
        {/* API 信息提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6"
        >
          <Card className="p-4 bg-blue-500/5 border-blue-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ExternalLink className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-[var(--text)] mb-1">
                  {isChinese ? 'API 接口演示' : 'API Interface Demo'}
                </h4>
                <p className="text-sm text-[var(--text-muted)]">
                  {isChinese
                    ? '此页面演示了从外部 API 获取实时市场数据的功能。点击"刷新数据"按钮可以模拟 API 调用并更新价格信息。'
                    : 'This page demonstrates fetching real-time market data from external APIs. Click the "Refresh Data" button to simulate API calls and update price information.'
                  }
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    {isChinese ? '模拟 API 延迟' : 'Simulated API delay'}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    {isChinese ? '随机价格波动' : 'Random price fluctuations'}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    {isChinese ? '可替换为真实 API' : 'Replaceable with real API'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default MarketPage;
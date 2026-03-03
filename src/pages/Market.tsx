import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight, ArrowDownRight, Star, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, PageTransition, PageHeader, Tag } from '../components/ui';

// ==================== Mock Market Data ====================

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
}

const mockMarketData: MarketToken[] = [
  {
    symbol: 'CC',
    name: 'Canton Coin',
    price: 1.25,
    change24h: 5.23,
    volume24h: 125000000,
    marketCap: 2500000000,
    high24h: 1.32,
    low24h: 1.18,
    icon: '◆',
    pinned: true,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3456.78,
    change24h: -2.15,
    volume24h: 15600000000,
    marketCap: 415000000000,
    high24h: 3520.00,
    low24h: 3380.50,
    icon: '◆',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67890.12,
    change24h: 1.85,
    volume24h: 28900000000,
    marketCap: 1335000000000,
    high24h: 68500.00,
    low24h: 66500.00,
    icon: '₿',
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
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    price: 0.85,
    change24h: -5.67,
    volume24h: 456000000,
    marketCap: 7800000000,
    high24h: 0.92,
    low24h: 0.82,
    icon: '⬡',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 145.32,
    change24h: 8.45,
    volume24h: 2340000000,
    marketCap: 62000000000,
    high24h: 152.00,
    low24h: 138.50,
    icon: '◎',
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    price: 18.76,
    change24h: -1.23,
    volume24h: 345000000,
    marketCap: 10500000000,
    high24h: 19.50,
    low24h: 18.20,
    icon: '⬢',
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    price: 9.45,
    change24h: 3.21,
    volume24h: 178000000,
    marketCap: 5600000000,
    high24h: 9.80,
    low24h: 9.10,
    icon: '🦄',
  },
];

type SortField = 'marketCap' | 'change24h' | 'volume24h';
type SortOrder = 'asc' | 'desc';

// ==================== Market 列表页 ====================

export const MarketPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activeTab, setActiveTab] = useState<'pinned' | 'all'>('all');

  // Filter and sort tokens
  const filteredTokens = useMemo(() => {
    let tokens = [...mockMarketData];
    
    // Filter by tab
    if (activeTab === 'pinned') {
      tokens = tokens.filter(t => t.pinned);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tokens = tokens.filter(
        t => 
          t.symbol.toLowerCase().includes(query) ||
          t.name.toLowerCase().includes(query)
      );
    }
    
    // Sort
    tokens.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
    
    return tokens;
  }, [searchQuery, sortField, sortOrder, activeTab]);

  // Format numbers
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toFixed(price < 1 ? 4 : 2);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${(volume / 1e3).toFixed(2)}K`;
  };

  const formatMarketCap = (mc: number) => {
    if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`;
    if (mc >= 1e9) return `$${(mc / 1e9).toFixed(2)}B`;
    if (mc >= 1e6) return `$${(mc / 1e6).toFixed(2)}M`;
    return `$${mc.toLocaleString()}`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-600">↕</span>;
    return sortOrder === 'desc' ? 
      <span className="text-blue-400">↓</span> : 
      <span className="text-blue-400">↑</span>;
  };

  return (
    <PageTransition className="min-h-screen">
      <PageHeader title={t('market.title')} subtitle={t('market.subtitle')} />
      
      <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4">
        {/* Search and Filter */}
        
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder={t('market.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            
            <div className="flex bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {t('market.allTokens')}
              </button>
              
              <button
                onClick={() => setActiveTab('pinned')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'pinned' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Star className="w-4 h-4" />
                {t('market.pinned')}
              </button>
            </div>
          </div>
        </Card>

        {/* Market Table */}
        
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Token</th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => handleSort('marketCap')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {t('market.marketCap')}
                      <SortIcon field="marketCap" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => handleSort('change24h')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {t('market.change24h')}
                      <SortIcon field="change24h" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => handleSort('volume24h')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {t('market.volume24h')}
                      <SortIcon field="volume24h" />
                    </div>
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-white/5">
                {filteredTokens.map((token, index) => (
                  <motion.tr
                    key={token.symbol}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                    onClick={() => navigate(`/market/${token.symbol.toLowerCase()}`)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{index + 1}</span>
                        {token.pinned && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-xl">
                          {token.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{token.symbol}</span>
                          </div>
                          <p className="text-sm text-gray-500">{token.name}</p>
                          <p className="text-sm font-medium text-white mt-0.5">
                            ${formatPrice(token.price)}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 text-right">
                      <span className="text-white">{formatMarketCap(token.marketCap)}</span>
                    </td>
                    
                    <td className="px-4 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${
                        token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {token.change24h >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span className="font-medium">
                          {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 text-right">
                      <span className="text-white">{formatVolume(token.volume24h)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTokens.length === 0 && (
            <div className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">{t('common.noData')}</p>
            </div>
          )}
        </Card>
      </div>
    </PageTransition>
  );
};

export default MarketPage;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  Wallet,
  Plus
} from 'lucide-react';
import { useWalletStore } from '../store';
import { Card, Tag, PageTransition, PageHeader } from '../components/ui';

// ==================== Assets 页面 ====================

export const AssetsPage: React.FC = () => {
  const { tokens, hideBalance } = useWalletStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'name'>('value');

  const totalBalance = tokens.reduce((acc, token) => {
    return acc + parseFloat(token.valueUSD.replace(/,/g, ''));
  }, 0);

  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (sortBy === 'value') {
      return parseFloat(b.valueUSD.replace(/,/g, '')) - parseFloat(a.valueUSD.replace(/,/g, ''));
    } else if (sortBy === 'change') {
      return parseFloat(b.change24h) - parseFloat(a.change24h);
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const positiveChange = tokens.filter(t => parseFloat(t.change24h) > 0).length;
  const negativeChange = tokens.filter(t => parseFloat(t.change24h) < 0).length;

  return (
    <PageTransition className="min-h-screen">
      {/* Page Header */}
      <PageHeader 
        title="Assets" 
        subtitle="Manage your portfolio"
        rightAction={
          <button
            onClick={() => navigate('/assets/import')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors touch-manipulation"
            title="Import token"
          >
            <Plus className="w-5 h-5 text-gray-400" />
          </button>
        }
      />
      
      <div className="p-6 lg:p-8 space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border-blue-500/20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-gray-400 mb-2 text-sm">Total Portfolio Value</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                {hideBalance ? '••••••' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-sm font-medium rounded-lg flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {positiveChange} up
                </span>
                <span className="px-2.5 py-1 bg-red-500/10 text-red-400 text-sm font-medium rounded-lg flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  {negativeChange} down
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Assets</p>
                <p className="text-2xl font-bold text-white">{tokens.length}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'value' | 'change' | 'name')}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="value" className="bg-[#111118]">Sort by Value</option>
            <option value="change" className="bg-[#111118]">Sort by Change</option>
            <option value="name" className="bg-[#111118]">Sort by Name</option>
          </select>
        </div>
      </motion.div>

      {/* Assets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="space-y-4">
            {sortedTokens.map((token, index) => (
              <motion.div
                key={token.symbol}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                onClick={() => navigate(`/assets/${token.symbol.toLowerCase()}`)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl font-bold text-blue-400 group-hover:scale-110 transition-transform">
                    {token.icon}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white text-lg">{token.symbol}</p>
                      <Tag variant={parseFloat(token.change24h) >= 0 ? 'success' : 'error'} className="text-xs">
                        {token.change24h}
                      </Tag>
                    </div>
                    <p className="text-sm text-gray-500">{token.name}</p>
                    <p className="text-xs text-gray-600">Balance: {token.balance} {token.symbol}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-white">
                    {hideBalance ? '••••••' : `$${token.valueUSD}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {hideBalance ? '••••••' : `$${token.price.toLocaleString()}`} / {token.symbol}
                  </p>
                  <div className="flex items-center gap-1 justify-end mt-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm">View details</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {sortedTokens.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No assets found matching "{searchQuery}"</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
    </PageTransition>
  );
};

export default AssetsPage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      <PageHeader 
        title={t('assets.title')} 
        subtitle={t('assets.subtitle')}
        rightAction={
          <button
            onClick={() => navigate('/assets/import')}
            className="p-2 hover:bg-[var(--card)] rounded-lg transition-colors touch-manipulation"
            title={t('assets.importToken')}
          >
            <Plus className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        }
      />
      
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border-blue-500/20">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-[var(--text-secondary)] mb-2 text-sm">{t('assets.totalValue')}</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-[var(--text)] tracking-tight">
                {hideBalance ? '••••••' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-2.5 py-1 bg-[var(--success-subtle)] text-[var(--success)] text-sm font-medium rounded-lg flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {positiveChange} {t('assets.positiveChange')}
                </span>
                <span className="px-2.5 py-1 bg-[var(--error-subtle)] text-[var(--error)] text-sm font-medium rounded-lg flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  {negativeChange} {t('assets.negativeChange')}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-right">
                <p className="text-sm text-[var(--text-secondary)]">{t('assets.totalAssets')}</p>
                <p className="text-2xl font-bold text-[var(--text)]">{tokens.length}</p>
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
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder={t('assets.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 pl-12 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'value' | 'change' | 'name')}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="value" className="bg-[var(--bg-elevated)]">{t('assets.sortValue')}</option>
            <option value="change" className="bg-[var(--bg-elevated)]">{t('assets.sortChange')}</option>
            <option value="name" className="bg-[var(--bg-elevated)]">{t('assets.sortName')}</option>
          </select>
        </div>
      </motion.div>

      {/* Assets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <div className="flex flex-col gap-3">
          {sortedTokens.map((token, index) => (
            <motion.div
              key={token.symbol}
              className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)] transition-all cursor-pointer group shadow-[var(--shadow-sm)]"
              onClick={() => navigate(`/assets/${token.symbol.toLowerCase()}`)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
            >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[var(--primary-subtle)] rounded-xl flex items-center justify-center text-2xl font-bold text-[var(--primary)] group-hover:scale-110 transition-transform">
                    {token.icon}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[var(--text)] text-lg">{token.symbol}</p>
                      <Tag variant={parseFloat(token.change24h) >= 0 ? 'success' : 'error'} className="text-xs">
                        {token.change24h}
                      </Tag>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">{token.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t('common.balance')}: {token.balance} {token.symbol}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-[var(--text)]">
                    {hideBalance ? '••••••' : `$${token.valueUSD}`}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {hideBalance ? '••••••' : `$${token.price.toLocaleString()}`} / {token.symbol}
                  </p>
                  <div className="flex items-center gap-1 justify-end mt-1 text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm">{t('common.viewDetails')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {sortedTokens.length === 0 && (
            <div className="text-center py-12 bg-[var(--card)] border border-[var(--border)] rounded-xl">
              <Wallet className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">{t('assets.noAssetsFound', { query: searchQuery })}</p>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default AssetsPage;
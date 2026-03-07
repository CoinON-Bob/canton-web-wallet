import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useWalletStore } from '../store';
import { shortAddress } from '../utils/address';
import { Card, Tag, PageTransition, useToast, ReceiveModal, AssetTrendChart, type ChartPeriod } from '../components/ui';

// ==================== Quick Action Button ====================

const QuickAction: React.FC<{
  icon: React.ReactNode;
  labelKey: string;
  to?: string;
  onClick?: () => void;
  color?: string;
  descriptionKey?: string;
}> = ({ icon, labelKey, to, onClick, color = 'blue', descriptionKey }) => {
  const { t } = useTranslation();
  const colorStyles = {
    blue: 'bg-[#00E676]/8 text-[#00E676] hover:bg-[#00E676]/12',
    green: 'bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/12',
    purple: 'bg-cyan-500/8 text-cyan-400 hover:bg-cyan-500/12',
    orange: 'bg-[#00E676]/8 text-[#00E676] hover:bg-[#00E676]/12',
  };

  const content = (
    <>
      <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center">
        <span className="text-sm font-semibold text-[var(--text)] block">{t(labelKey)}</span>
        {descriptionKey && (
          <span className="text-xs text-[var(--text-muted)] block mt-0.5 opacity-80">
            {t(descriptionKey)}
          </span>
        )}
      </div>
    </>
  );

  const baseClass = `flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl ${colorStyles[color as keyof typeof colorStyles]} transition-all duration-200 touch-manipulation active:scale-[0.98] w-full h-full min-h-[100px]`;

  if (onClick) {
    return (
      <motion.button
        onClick={onClick}
        className={baseClass}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Link to={to || '/'} className={baseClass + ' block'}>
        {content}
      </Link>
    </motion.div>
  );
};

// ==================== Animated Number ====================
const AnimatedNumber: React.FC<{ value: string; className?: string }> = ({ value, className = '' }) => (
  <motion.span
    className={className}
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {value}
  </motion.span>
);

// ==================== Dashboard Page ====================

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const translateTxType = (type: string) => {
    const map: Record<string, string> = {
      Send: t('activity.typeSend'),
      Receive: t('activity.typeReceive'),
      Swap: t('activity.typeSwap'),
      Batch: t('activity.typeBatch'),
      Offer: t('activity.typeOffer'),
    };
    return map[type] || type;
  };

  const translateTxStatus = (status: string) => {
    const map: Record<string, string> = {
      Confirmed: t('activity.confirmed'),
      Pending: t('activity.pending'),
      Failed: t('activity.failed'),
      Created: t('activity.created'),
      Signing: t('activity.signing'),
      Broadcasted: t('activity.broadcasted'),
    };
    return map[status] || status;
  };

  const { tokens, transactions, offers, batchTransfers, user, hideBalance, toggleHideBalance } = useWalletStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('7D');

  const totalBalance = tokens.reduce((acc, token) => acc + parseFloat(token.valueUSD.replace(/,/g, '')), 0);
  const totalChange = tokens.reduce((acc, token) => acc + parseFloat(token.change24h), 0) / tokens.length;
  const pendingOffers = offers.filter((o) => o.status === 'pending').length;
  const processingBatches = batchTransfers.filter((b) => b.status === 'Processing').length;

  const handleCopyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      showToast(t('common.copied'), 'success');
    }
  };

  const formatAddress = (addr: string) => shortAddress(addr, 6, 4);

  const stats = [
    { labelKey: 'dashboard.assets', value: tokens.length, change: `${tokens.length} ${t('common.tokens') || 'tokens'}`, positive: true },
    { labelKey: 'dashboard.offers', value: pendingOffers, change: t('dashboard.pending'), positive: pendingOffers > 0 },
    { labelKey: 'dashboard.batches', value: processingBatches, change: t('dashboard.active'), positive: processingBatches > 0 },
    { labelKey: 'dashboard.volume24h', value: '$12.5K', change: '+15%', positive: true },
  ];

  return (
    <PageTransition className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 lg:space-y-8">
      {/* ========== Layer 1: 资产总览 + 动态走势图 ========== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F1419] via-[#0A0E17] to-[#0F1419] border border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
      >
        <div className="flex flex-col lg:flex-row lg:min-h-[240px]">
          {/* 左侧：总资产 */}
          <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between lg:min-w-[300px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-[var(--text-muted)] font-medium">{t('dashboard.totalBalance')}</span>
                <button
                  onClick={toggleHideBalance}
                  className="p-1.5 hover:bg-white/5 rounded-lg transition-colors touch-manipulation"
                  aria-label={hideBalance ? t('dashboard.show') : t('dashboard.hide')}
                >
                  {hideBalance ? <EyeOff className="w-4 h-4 text-[var(--text-muted)]" /> : <Eye className="w-4 h-4 text-[var(--text-muted)]" />}
                </button>
              </div>

              <div className="flex items-baseline gap-4 mt-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] font-display tracking-tight">
                  {hideBalance ? '••••••' : (
                    <AnimatedNumber value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                  )}
                </h1>

                {!hideBalance && (
                  <div
                    className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg ${
                      totalChange >= 0 ? 'bg-[#00E676]/12 text-[#00E676]' : 'bg-red-500/12 text-red-400'
                    }`}
                  >
                    {totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 cursor-pointer group" onClick={handleCopyAddress}>
                <span className="text-sm text-[var(--text-muted)] font-mono group-hover:text-[var(--text-secondary)] transition-colors">
                  {user?.walletAddress ? formatAddress(user.walletAddress) : ''}
                </span>
                <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors touch-manipulation" title={t('common.copy')}>
                  <Copy className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]" />
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：动态走势图 */}
          {!hideBalance && (
            <div className="flex-1 lg:min-w-[400px] border-t lg:border-t-0 lg:border-l border-white/[0.04] p-4 lg:p-6">
              <div className="h-full flex flex-col" style={{ minHeight: 220 }}>
                <span className="text-xs text-[var(--text-muted)] mb-2 font-medium">{chartPeriod} {t('dashboard.totalBalance')}</span>
                <div className="flex-1 min-h-[180px]">
                  <AssetTrendChart
                    currentValue={totalBalance}
                    changePercent={totalChange}
                    period={chartPeriod}
                    onPeriodChange={setChartPeriod}
                    height={220}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ========== Layer 2: 四个主要操作按钮 ========== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
      >
        {[
          { icon: <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />, labelKey: 'dashboard.send', to: '/send', color: 'blue' as const, desc: 'dashboard.quickTransfer' },
          { icon: <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />, labelKey: 'dashboard.receive', onClick: () => setIsReceiveModalOpen(true), color: 'green' as const, desc: 'dashboard.receiveFunds' },
          { icon: <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />, labelKey: 'dashboard.swap', to: '/swap', color: 'purple' as const, desc: 'dashboard.swapDesc' },
          { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />, labelKey: 'dashboard.batchTransfer', to: '/batch', color: 'orange' as const, desc: 'dashboard.batchDesc' },
        ].map((action) => (
          <motion.div
            key={action.labelKey}
            className="rounded-xl bg-[#141B26]/80 border border-white/[0.04] hover:border-[#00E676]/20 hover:shadow-[0_0_20px_rgba(0,230,118,0.08)] transition-all duration-200 overflow-hidden"
            whileHover={{ y: -2 }}
          >
            <QuickAction
              icon={action.icon}
              labelKey={action.labelKey}
              to={action.to}
              onClick={action.onClick}
              color={action.color}
              descriptionKey={action.desc}
            />
          </motion.div>
        ))}
      </motion.section>

      {/* ========== Layer 3: 数据统计卡 ========== */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.labelKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="rounded-xl bg-[#141B26]/60 border border-white/[0.04] p-4 hover:border-white/[0.08] hover:bg-[#141B26]/80 transition-all cursor-pointer"
          >
            <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">{t(stat.labelKey)}</p>
            <p className="text-2xl font-bold text-[var(--text)] font-display">{stat.value}</p>
            <p className={`text-xs mt-1 ${stat.positive ? 'text-[#00E676]' : 'text-[var(--text-muted)]'}`}>{stat.change}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* ========== Layer 4: 资产列表 + 最近活动 ========== */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 资产列表 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl bg-[#141B26]/60 border border-white/[0.04] p-4 lg:p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--text)]">{t('dashboard.assets')}</h3>
            <Link to="/assets" className="text-sm text-[#00E676] hover:text-[#00C853] flex items-center gap-1 transition-colors">
              {t('common.viewAll')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-2">
            {tokens.slice(0, 5).map((token, index) => (
              <motion.div
                key={token.symbol}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-colors"
                onClick={() => navigate('/assets')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + index * 0.03 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00E676]/10 flex items-center justify-center text-lg font-bold text-[#00E676]">
                    {token.icon}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text)]">{token.symbol}</p>
                    <p className="text-xs text-[var(--text-muted)]">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--text)]">${token.valueUSD}</p>
                  <p className={`text-xs font-medium ${token.change24h.startsWith('+') ? 'text-[#00E676]' : 'text-red-400'}`}>{token.change24h}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 最近活动 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-xl bg-[#141B26]/60 border border-white/[0.04] p-4 lg:p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--text)]">{t('dashboard.recentActivity')}</h3>
            <Link to="/activity" className="text-sm text-[#00E676] hover:text-[#00C853] flex items-center gap-1 transition-colors">
              {t('common.viewAll')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx, index) => (
              <motion.div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-colors"
                onClick={() => navigate('/activity')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.03 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      tx.type === 'Send' ? 'bg-red-500/10 text-red-400' : tx.type === 'Receive' ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-cyan-500/10 text-cyan-400'
                    }`}
                  >
                    {tx.type === 'Send' ? <ArrowUpRight className="w-4 h-4" /> : tx.type === 'Receive' ? <ArrowDownLeft className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text)]">{translateTxType(tx.type)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{tx.amount} {tx.token}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Tag variant={tx.status === 'Confirmed' ? 'success' : tx.status === 'Pending' ? 'warning' : 'error'} className="text-[10px] px-2 py-0.5">
                    {translateTxStatus(tx.status)}
                  </Tag>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">{new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      <ReceiveModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        address={user?.walletAddress || ''}
        onCopy={() => showToast(t('common.copied'), 'success')}
      />
    </PageTransition>
  );
};

export default DashboardPage;

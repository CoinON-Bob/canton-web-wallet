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
  EyeOff
} from 'lucide-react';
import { useWalletStore } from '../store';
import { shortAddress } from '../utils/address';
import { Card, Tag, PageTransition, useToast, ReceiveModal } from '../components/ui';

// ==================== Quick Action Button ====================

const QuickAction: React.FC<{
  icon: React.ReactNode;
  labelKey: string;
  to?: string;
  onClick?: () => void;
  color?: string;
}> = ({ icon, labelKey, to, onClick, color = 'blue' }) => {
  const { t } = useTranslation();
  const colorStyles = {
    blue: 'bg-[var(--primary-subtle)] text-[var(--primary)] active:bg-[var(--primary)]/20',
    green: 'bg-[var(--success-subtle)] text-[var(--success)] active:bg-[var(--success)]/20',
    purple: 'bg-purple-500/10 text-purple-400 active:bg-purple-500/20',
    orange: 'bg-[var(--warning-subtle)] text-[var(--warning)] active:bg-[var(--warning)]/20',
  };

  const content = (
    <>
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--card)] flex items-center justify-center">
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-medium text-[var(--text)]">{t(labelKey)}</span>
    </>
  );

  const baseClass = `flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl ${colorStyles[color as keyof typeof colorStyles]} transition-all touch-manipulation active:scale-95 w-full h-full min-h-[80px] sm:min-h-0`;

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClass}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to || '/'} className={baseClass}>
      {content}
    </Link>
  );
};

// ==================== Dashboard Page ====================

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { tokens, transactions, offers, batchTransfers, user, hideBalance, toggleHideBalance } = useWalletStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

  const totalBalance = tokens.reduce((acc, token) => {
    return acc + parseFloat(token.valueUSD.replace(/,/g, ''));
  }, 0);

  const totalChange = tokens.reduce((acc, token) => {
    return acc + parseFloat(token.change24h);
  }, 0) / tokens.length;

  const pendingOffers = offers.filter(o => o.status === 'pending').length;
  const processingBatches = batchTransfers.filter(b => b.status === 'Processing').length;

  const handleCopyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      showToast(t('common.copied'), 'success');
    }
  };

  const formatAddress = (addr: string) => shortAddress(addr, 6, 4);

  return (
    <PageTransition className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 max-w-7xl mx-auto">
      {/* Main Balance Card */}
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent border-blue-500/10">
          <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            {/* Balance Section */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs sm:text-sm text-[var(--text-muted)]">{t('dashboard.totalBalance')}</span>
                <button
                  onClick={toggleHideBalance}
                  className="p-1.5 hover:bg-[var(--card-hover)] rounded transition-colors touch-manipulation"
                  aria-label={hideBalance ? t('dashboard.show') : t('dashboard.hide')}
                >
                  {hideBalance ? <EyeOff className="w-4 h-4 text-[var(--text-muted)]" /> : <Eye className="w-4 h-4 text-[var(--text-muted)]" />}
                </button>
              </div>
              
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)]">
                  {hideBalance ? '••••••' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </h1>
                
                {!hideBalance && (
                  <div className={`flex items-center gap-1 text-xs sm:text-sm ${totalChange >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                    {totalChange >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span>{totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2 cursor-pointer" onClick={handleCopyAddress}>
                <span className="text-xs sm:text-sm text-[var(--text-muted)] font-mono hover:text-gray-300 transition-colors">
                  {user?.walletAddress ? formatAddress(user.walletAddress) : ''}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 hover:bg-[var(--card-hover)] rounded transition-colors touch-manipulation"
                  title={t('common.copy')}
                >
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-muted)] hover:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
              <QuickAction
                icon={<ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />}
                labelKey="nav.send"
                to="/send"
                color="blue"
              />
              <QuickAction
                icon={<ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />}
                labelKey="dashboard.receive"
                onClick={() => setIsReceiveModalOpen(true)}
                color="green"
              />
              <QuickAction
                icon={<Repeat className="w-5 h-5 sm:w-6 sm:h-6" />}
                labelKey="nav.swap"
                to="/swap"
                color="purple"
              />
              <QuickAction
                icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
                labelKey="nav.batch"
                to="/batch"
                color="orange"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          { labelKey: 'dashboard.assets', value: tokens.length, change: `${tokens.length} ${t('common.tokens') || 'tokens'}`, positive: true },
          { labelKey: 'dashboard.offers', value: pendingOffers, change: t('dashboard.pending'), positive: pendingOffers > 0 },
          { labelKey: 'dashboard.batches', value: processingBatches, change: t('dashboard.active'), positive: processingBatches > 0 },
          { labelKey: 'dashboard.volume24h', value: '$12.5K', change: '+15%', positive: true },
        ].map((stat, i) => (
          <motion.div
            key={stat.labelKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="p-3 sm:p-4 hover:bg-[var(--card-hover)] transition-colors cursor-pointer touch-manipulation">
              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mb-1">{t(stat.labelKey)}</p>
              <p className="text-lg sm:text-xl font-bold text-[var(--text)]">{stat.value}</p>
              <p className={`text-[10px] sm:text-xs mt-0.5 ${stat.positive ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>{stat.change}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Single Column Layout */}
      <div className="space-y-3 sm:space-y-4">
        {/* Assets List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-[var(--text)]">{t('dashboard.assets')}</h3>
              
              <Link 
                to="/assets"
                className="text-xs sm:text-sm text-[var(--primary)] hover:text-[var(--primary-600)] flex items-center gap-1 transition-colors touch-manipulation"
              >
                {t('common.viewAll')}
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="space-y-2">
              {tokens.slice(0, 5).map((token, index) => (
                <motion.div
                  key={token.symbol}
                  className="flex items-center justify-between p-2.5 sm:p-3 bg-[var(--card-hover)] rounded-lg cursor-pointer hover:bg-[var(--card-active)] transition-colors touch-manipulation active:scale-[0.98]"
                  onClick={() => navigate('/assets')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + index * 0.03 }}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--primary-subtle)] rounded-lg flex items-center justify-center text-base sm:text-lg font-bold text-[var(--primary)]">
                      {token.icon}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)] text-sm">{token.symbol}</p>
                      <p className="text-xs text-[var(--text-muted)]">{token.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-[var(--text)] text-sm">${token.valueUSD}</p>
                    <p className={`text-xs ${token.change24h.startsWith('+') ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                      {token.change24h}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-[var(--text)]">{t('dashboard.recentActivity')}</h3>
              
              <Link 
                to="/activity"
                className="text-xs sm:text-sm text-[var(--primary)] hover:text-[var(--primary-600)] flex items-center gap-1 transition-colors touch-manipulation"
              >
                {t('common.viewAll')}
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx, index) => (
                <motion.div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 bg-[var(--card-hover)] rounded-lg cursor-pointer hover:bg-[var(--card-active)] transition-colors touch-manipulation active:scale-[0.98]"
                  onClick={() => navigate('/activity')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${
                      tx.type === 'Send' ? 'bg-red-500/10 text-[var(--error)]' :
                      tx.type === 'Receive' ? 'bg-green-500/10 text-[var(--success)]' :
                      'bg-[var(--primary-subtle)] text-[var(--primary)]'
                    }`}>
                      {tx.type === 'Send' ? <ArrowUpRight className="w-4 h-4" /> : 
                       tx.type === 'Receive' ? <ArrowDownLeft className="w-4 h-4" /> : 
                       <Repeat className="w-4 h-4" />}
                    </div>

                    <div>
                      <p className="font-medium text-[var(--text)] text-sm">{tx.type}</p>
                      <p className="text-xs text-[var(--text-muted)]">{tx.amount} {tx.token}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Tag variant={
                      tx.status === 'Confirmed' ? 'success' :
                      tx.status === 'Pending' ? 'warning' : 'error'
                    } className="text-[10px] px-1.5 py-0.5">
                      {tx.status}
                    </Tag>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      {new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Receive Modal */}
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
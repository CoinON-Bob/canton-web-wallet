import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft,
  Repeat,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Copy,
  Check,
  Wallet,
  Eye,
  EyeOff
} from 'lucide-react';
import { useWalletStore } from '../store';
import { Card, Tag, PageTransition, useToast, ReceiveModal } from '../components/ui';

// ==================== Quick Action Button (Touch Optimized) ====================

const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  to?: string;
  onClick?: () => void;
  color?: string;
}> = ({ icon, label, to, onClick, color = 'blue' }) => {
  const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-400 active:bg-blue-500/20',
    green: 'bg-green-500/10 text-green-400 active:bg-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 active:bg-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 active:bg-orange-500/20',
  };

  const content = (
    <>
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl ${colorStyles[color as keyof typeof colorStyles]} transition-colors touch-manipulation active:scale-95`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to || '/'}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl ${colorStyles[color as keyof typeof colorStyles]} transition-colors touch-manipulation active:scale-95`}
    >
      {content}
    </Link>
  );
};

// ==================== Dashboard Page ====================

export const DashboardPage: React.FC = () => {
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
      showToast('Address copied', 'success');
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

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
                <span className="text-xs sm:text-sm text-gray-500">Total Balance</span>
                <button
                  onClick={toggleHideBalance}
                  className="p-1.5 hover:bg-white/5 rounded transition-colors touch-manipulation"
                  aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
                >
                  {hideBalance ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
              
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  {hideBalance ? '••••••' : `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </h1>
                
                {!hideBalance && (
                  <div className={`flex items-center gap-1 text-xs sm:text-sm ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalChange >= 0 ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span>{totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2 cursor-pointer" onClick={handleCopyAddress}>
                <span className="text-xs sm:text-sm text-gray-500 font-mono hover:text-gray-300 transition-colors">
                  {user?.walletAddress ? formatAddress(user.walletAddress) : ''}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 hover:bg-white/5 rounded transition-colors touch-manipulation"
                  title="Copy address"
                >
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 hover:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Quick Actions - Horizontal Scroll on Mobile */}
            
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
              <QuickAction 
                icon={<ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />} 
                label="Send" 
                to="/send" 
                color="blue"
              />
              <QuickAction 
                icon={<ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />} 
                label="Receive" 
                onClick={() => setIsReceiveModalOpen(true)}
                color="green"
              />
              <QuickAction 
                icon={<Repeat className="w-5 h-5 sm:w-6 sm:h-6" />} 
                label="Swap" 
                to="/swap" 
                color="purple"
              />
              <QuickAction 
                icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />} 
                label="Batch" 
                to="/batch" 
                color="orange"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Row - 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Assets', value: tokens.length, change: `${tokens.length} tokens`, positive: true },
          { label: 'Offers', value: pendingOffers, change: 'Pending', positive: pendingOffers > 0 },
          { label: 'Batches', value: processingBatches, change: 'Active', positive: processingBatches > 0 },
          { label: '24h Volume', value: `$12.5K`, change: '+15%', positive: true },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="p-3 sm:p-4 hover:bg-white/[0.04] transition-colors cursor-pointer touch-manipulation">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold text-white">{stat.value}</p>
              <p className={`text-[10px] sm:text-xs mt-0.5 ${stat.positive ? 'text-green-400' : 'text-gray-500'}`}>{stat.change}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Single Column Layout for Mobile */}
      <div className="space-y-3 sm:space-y-4">
        {/* Assets List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-white">Assets</h3>
              
              <Link 
                to="/assets"
                className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors touch-manipulation"
              >
                View all
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="space-y-2">
              {tokens.slice(0, 5).map((token, index) => (
                <motion.div
                  key={token.symbol}
                  className="flex items-center justify-between p-2.5 sm:p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors touch-manipulation active:scale-[0.98]"
                  onClick={() => navigate('/assets')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + index * 0.03 }}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-base sm:text-lg font-bold text-blue-400">
                      {token.icon}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{token.symbol}</p>
                      <p className="text-xs text-gray-500">{token.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-white text-sm">${token.valueUSD}</p>
                    <p className={`text-xs ${token.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
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
              <h3 className="text-sm sm:text-base font-semibold text-white">Recent Activity</h3>
              
              <Link 
                to="/activity"
                className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors touch-manipulation"
              >
                View all
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx, index) => (
                <motion.div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors touch-manipulation active:scale-[0.98]"
                  onClick={() => navigate('/activity')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${
                      tx.type === 'Send' ? 'bg-red-500/10 text-red-400' :
                      tx.type === 'Receive' ? 'bg-green-500/10 text-green-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {tx.type === 'Send' ? <ArrowUpRight className="w-4 h-4" /> : 
                       tx.type === 'Receive' ? <ArrowDownLeft className="w-4 h-4" /> : 
                       <Repeat className="w-4 h-4" />}
                    </div>

                    <div>
                      <p className="font-medium text-white text-sm">{tx.type}</p>
                      <p className="text-xs text-gray-500">{tx.amount} {tx.token}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Tag variant={
                      tx.status === 'Confirmed' ? 'success' :
                      tx.status === 'Pending' ? 'warning' : 'error'
                    } className="text-[10px] px-1.5 py-0.5">
                      {tx.status}
                    </Tag>
                    <p className="text-[10px] text-gray-500 mt-1">
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
        onCopy={() => showToast('Address copied', 'success')}
      />
    </PageTransition>
  );
};

export default DashboardPage;

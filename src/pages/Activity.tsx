import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  Users,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useWalletStore } from '../store';
import { Card, PageTransition, PageHeader, Tag } from '../components/ui';
import type { Transaction, TransactionStatus, TransactionType } from '../types';

// ==================== Activity 页面 ====================

type FilterStatus = 'all' | TransactionStatus;
type FilterType = 'all' | TransactionType;

export const ActivityPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { transactions } = useWalletStore();
  const isChinese = i18n.language === 'zh';

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
      all: t('activity.all'),
      Confirmed: t('activity.confirmed'),
      Pending: t('activity.pending'),
      Failed: t('activity.failed'),
      Created: t('activity.created'),
      Signing: t('activity.signing'),
      Broadcasted: t('activity.broadcasted'),
    };
    return map[status] || status;
  };
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, searchQuery, statusFilter, typeFilter]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    
    filteredTransactions.forEach(tx => {
      const date = new Date(tx.timestamp).toLocaleDateString(
        isChinese ? 'zh-CN' : 'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      );
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });
    
    return groups;
  }, [filteredTransactions, isChinese]);

  // Stats
  const stats = useMemo(() => {
    const confirmed = transactions.filter(tx => tx.status === 'Confirmed').length;
    const pending = transactions.filter(tx => tx.status === 'Pending').length;
    const failed = transactions.filter(tx => tx.status === 'Failed').length;
    return { confirmed, pending, failed };
  }, [transactions]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    // Could add toast here
  };

  const getTxIcon = (type: TransactionType) => {
    switch (type) {
      case 'Send': return <ArrowUpRight className="w-5 h-5" />;
      case 'Receive': return <ArrowDownLeft className="w-5 h-5" />;
      case 'Swap': return <Repeat className="w-5 h-5" />;
      case 'Batch': return <Users className="w-5 h-5" />;
      case 'Offer': return <Gift className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
      case 'Failed': return <XCircle className="w-4 h-4 text-[var(--error)]" />;
      case 'Pending': return <Clock className="w-4 h-4 text-[var(--warning)]" />;
      default: return <Clock className="w-4 h-4 text-[var(--primary)]" />;
    }
  };

  const getStatusVariant = (status: TransactionStatus): 'success' | 'error' | 'warning' | 'info' => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Failed': return 'error';
      case 'Pending': return 'warning';
      default: return 'info';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString(isChinese ? 'zh-CN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !isChinese,
    });
  };

  return (
    <PageTransition className="min-h-screen">
      <PageHeader 
        title={t('activity.title')} 
        subtitle={t('activity.subtitle')}
      />
      
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        {/* Stats */}
        
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <p className="text-xs text-[var(--text-muted)] mb-1">{t('activity.confirmed')}</p>
            <p className="text-2xl font-bold text-[var(--success)]">{stats.confirmed}</p>
          </Card>

          <Card className="p-4 text-center">
            <p className="text-xs text-[var(--text-muted)] mb-1">{t('activity.pending')}</p>
            <p className="text-2xl font-bold text-[var(--warning)]">{stats.pending}</p>
          </Card>

          <Card className="p-4 text-center">
            <p className="text-xs text-[var(--text-muted)] mb-1">{t('activity.failed')}</p>
            <p className="text-2xl font-bold text-[var(--error)]">{stats.failed}</p>
          </Card>
        </div>

        {/* Search & Filter */}
        
        <Card className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder={t('activity.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-hover)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
                showFilters ? 'bg-blue-500/20 text-[var(--primary)]' : 'bg-[var(--card-hover)] text-[var(--text-secondary)] hover:bg-[var(--card-active)]'
              }`}
            >
              <Filter className="w-5 h-5" />
              {t('activity.filters')}
            </button>
          </div>
          
          {/* Filter Options */}
          
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-4"
            >
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('activity.status')}</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'Confirmed', 'Pending', 'Failed', 'Created', 'Signing', 'Broadcasted'] as FilterStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        statusFilter === status
                          ? 'bg-blue-500/20 text-[var(--primary)] border border-blue-500/30'
                          : 'bg-[var(--card-hover)] text-[var(--text-secondary)] hover:bg-[var(--card-active)]'
                      }`}
                    >
                      {translateTxStatus(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('activity.type')}</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'Send', 'Receive', 'Swap', 'Batch', 'Offer'] as FilterType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        typeFilter === type
                          ? 'bg-blue-500/20 text-[var(--primary)] border border-blue-500/30'
                          : 'bg-[var(--card-hover)] text-[var(--text-secondary)] hover:bg-[var(--card-active)]'
                      }`}
                    >
                      {type === 'all' ? t('activity.all') : translateTxType(type)}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Transaction List */}
        
        <div className="space-y-4">
          {Object.entries(groupedTransactions).length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--card-hover)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{t('activity.noTransactions')}</h3>
              <p className="text-[var(--text-muted)]">{t('activity.noTransactionsDesc')}</p>
            </Card>
          ) : (
            Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date}>
                <p className="text-sm text-[var(--text-muted)] mb-3 sticky top-0 bg-[var(--bg)]/95 backdrop-blur py-2 z-10">{date}</p>
                
                <div className="space-y-2">
                  {txs.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      <Card className="p-4 hover:bg-[var(--card)]/[0.03] transition-colors cursor-pointer"
                        onClick={() => navigate(`/activity/${tx.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            tx.type === 'Send' ? 'bg-[var(--error-subtle)] text-[var(--error)]' :
                            tx.type === 'Receive' ? 'bg-[var(--success-subtle)] text-[var(--success)]' :
                            tx.type === 'Swap' ? 'bg-purple-500/10 text-purple-400' :
                            tx.type === 'Batch' ? 'bg-orange-500/10 text-orange-400' :
                            'bg-[var(--primary-subtle)] text-[var(--primary)]'
                          }`}>
                            {getTxIcon(tx.type)}
                          </div>

                          {/* Info */}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[var(--text)] font-medium">{translateTxType(tx.type)}</span>
                              <Tag variant={getStatusVariant(tx.status)} className="text-xs">
                                {translateTxStatus(tx.status)}
                              </Tag>
                            </div>
                            
                            <p className="text-sm text-[var(--text-muted)] truncate">
                              {tx.description || `${tx.type} ${tx.amount} ${tx.token}`}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[var(--text-muted)] font-mono">
                                {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                              </span>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyHash(tx.hash);
                                }}
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 hover:bg-[var(--card-hover)] rounded transition-all touch-manipulation"
                              >
                                <Copy className="w-3 h-3 text-[var(--text-muted)]" />
                              </button>
                            </div>
                          </div>

                          {/* Amount & Time */}
                          
                          <div className="text-right">
                            <p className="text-[var(--text)] font-medium">
                              {tx.type === 'Send' ? '-' : tx.type === 'Receive' ? '+' : ''}
                              {tx.amount} {tx.token}
                            </p>
                            
                            <p className="text-sm text-[var(--text-muted)]">{formatTime(tx.timestamp)}</p>
                            
                            <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {getStatusIcon(tx.status)}
                              <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ActivityPage;
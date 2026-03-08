import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  ChevronDown,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, PageTransition, PageHeader } from '../components/ui';
import { useWalletStore, ContractOrder, ContractPosition } from '../store';

// ==================== 交易对配置 ====================

const PAIRS = [
  {
    id: 'CC/BTC',
    label: 'CC/BTC',
    lastPrice: '1.2540',
    change24h: '+5.23%',
    isPositive: true,
    high24h: '1.3200',
    low24h: '1.1800',
    volume24h: '$125M',
    fundingRate: '0.01%',
    currentPrice: 1.2540,
  },
  {
    id: 'CC/USDC',
    label: 'CC/USDC',
    lastPrice: '3,456.78',
    change24h: '-2.15%',
    isPositive: false,
    high24h: '3,520.00',
    low24h: '3,380.50',
    volume24h: '$8.5B',
    fundingRate: '-0.005%',
    currentPrice: 3456.78,
  },
];

const LEVERAGES = [5, 10, 20, 50];

// ==================== 状态徽章 ====================

const StatusBadge: React.FC<{ status: ContractOrder['status'] }> = ({ status }) => {
  const { i18n } = useTranslation();
  const isChinese = i18n.language === 'zh';
  const map: Record<ContractOrder['status'], { label: string; labelZh: string; cls: string }> = {
    Filled:    { label: 'Filled',    labelZh: '已成交', cls: 'bg-green-500/10 text-green-400' },
    Open:      { label: 'Open',      labelZh: '待成交', cls: 'bg-blue-500/10 text-blue-400' },
    Cancelled: { label: 'Cancelled', labelZh: '已取消', cls: 'bg-red-500/10 text-red-400' },
  };
  const item = map[status];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.cls}`}>
      {isChinese ? item.labelZh : item.label}
    </span>
  );
};

// ==================== 下单弹窗 ====================

interface PlaceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pairId: string;
  currentPrice: number;
}

const PlaceOrderModal: React.FC<PlaceOrderModalProps> = ({ isOpen, onClose, pairId, currentPrice }) => {
  const { t } = useTranslation();
  const { addContractOrder, addContractPosition } = useWalletStore();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [leverage, setLeverage] = useState(10);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!amount.trim() || isNaN(Number(amount))) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 900));

    const priceStr = currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    const valueNum = Number(amount) * currentPrice;
    const valueStr = `$${valueNum.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

    const newOrder: ContractOrder = {
      id: `co${Date.now()}`,
      pair: pairId,
      side,
      amount: Number(amount).toLocaleString('en-US'),
      price: priceStr,
      leverage,
      status: 'Filled',
      timestamp: new Date().toISOString(),
      value: valueStr,
    };
    addContractOrder(newOrder);

    // 同时创建/更新持仓（做多 = buy，做空 = sell）
    const newPosition: ContractPosition = {
      id: `cp${Date.now()}`,
      pair: pairId,
      side: side === 'buy' ? 'long' : 'short',
      size: `${Number(amount).toLocaleString('en-US')} ${pairId.split('/')[0]}`,
      entryPrice: priceStr,
      currentPrice: priceStr,
      unrealizedPnl: '$0.00',
      margin: `$${(valueNum / leverage).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      leverage,
      timestamp: new Date().toISOString(),
    };
    addContractPosition(newPosition);

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount('');
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-2xl shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text)]">{t('contracts.placeOrder')} · {pairId}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--card)] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Buy / Sell tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[var(--card)] p-1 rounded-xl">
            <button
              onClick={() => setSide('buy')}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                side === 'buy'
                  ? 'bg-green-500 text-white shadow'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {t('contracts.buy')}
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                side === 'sell'
                  ? 'bg-red-500 text-white shadow'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {t('contracts.sell')}
            </button>
          </div>

          {/* Last price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">{t('contracts.lastPrice')}</span>
            <span className="font-semibold text-[var(--text)] tabular-nums">{currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Leverage selector */}
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">{t('contracts.leverage')}</label>
            <div className="grid grid-cols-4 gap-2">
              {LEVERAGES.map(lv => (
                <button
                  key={lv}
                  onClick={() => setLeverage(lv)}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                    leverage === lv
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
                  }`}
                >
                  {lv}x
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-2">{t('contracts.orderAmount')}</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={t('contracts.orderAmountPlaceholder')}
              className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors tabular-nums"
            />
          </div>

          {/* Estimated value */}
          {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
            <div className="flex items-center justify-between text-sm bg-[var(--card)] rounded-xl px-3 py-2">
              <span className="text-[var(--text-muted)]">{t('common.value')}</span>
              <span className="font-medium text-[var(--text)] tabular-nums">
                ≈ ${(Number(amount) * currentPrice / leverage).toLocaleString('en-US', { maximumFractionDigits: 2 })} margin
              </span>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || submitted || !amount.trim()}
            className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              submitted
                ? 'bg-green-500'
                : side === 'buy'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {submitted
              ? t('contracts.orderPlaced')
              : isSubmitting
              ? t('contracts.orderSubmitting')
              : t('contracts.orderSubmit')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==================== 合约页面 ====================

export const ContractsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language === 'zh';
  const { contractOrders, contractPositions, closeContractPosition } = useWalletStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'positions'>('orders');
  const [selectedPairId, setSelectedPairId] = useState('CC/BTC');
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const pair = PAIRS.find(p => p.id === selectedPairId) ?? PAIRS[0];

  // 过滤当前交易对的记录
  const filteredOrders = contractOrders.filter(o => o.pair === selectedPairId);
  const filteredPositions = contractPositions.filter(p => p.pair === selectedPairId);

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <PageTransition className="min-h-screen">
      <PageHeader
        title={t('contracts.title')}
        subtitle={t('contracts.subtitle')}
      />

      <div className="p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto space-y-4">

        {/* 交易对选择器 */}
        <div className="relative">
          <button
            onClick={() => setShowPairSelector(!showPairSelector)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--card-hover)] transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-[var(--primary)]" />
            <span className="font-semibold text-[var(--text)]">{selectedPairId}</span>
            <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${showPairSelector ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showPairSelector && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowPairSelector(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-1 z-40 min-w-[180px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden"
                >
                  {PAIRS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPairId(p.id); setShowPairSelector(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        p.id === selectedPairId
                          ? 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                          : 'text-[var(--text)] hover:bg-[var(--card-hover)]'
                      }`}
                    >
                      <span className="font-medium">{p.label}</span>
                      <span className={`text-xs ${p.isPositive ? 'text-green-400' : 'text-red-400'}`}>{p.change24h}</span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* 行情卡 */}
        <motion.div
          key={selectedPairId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-500/8 via-green-500/3 to-transparent border-green-500/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-[var(--text)]">{pair.id}</span>
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                    {isChinese ? '永续' : 'Perp'}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{t('contracts.pair')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[var(--text)] tabular-nums">{pair.lastPrice}</p>
                <div className={`flex items-center gap-1 justify-end text-sm ${pair.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {pair.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{pair.change24h}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: t('contracts.high24h'), value: pair.high24h, color: 'text-green-400' },
                { label: t('contracts.low24h'),  value: pair.low24h,  color: 'text-red-400' },
                { label: t('contracts.volume24h'), value: pair.volume24h, color: 'text-[var(--text)]' },
                { label: isChinese ? '资金费率' : 'Funding Rate', value: pair.fundingRate, color: 'text-[var(--primary)]' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[var(--card-hover)] rounded-xl p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-1 truncate">{stat.label}</p>
                  <p className={`font-semibold text-sm tabular-nums ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* 下单按钮组 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowOrderModal(true)}
                className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                {t('contracts.buy')}
              </button>
              <button
                onClick={() => setShowOrderModal(true)}
                className="py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <TrendingDown className="w-4 h-4" />
                {t('contracts.sell')}
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Tab 切换 */}
        <div className="flex gap-2">
          {(['orders', 'positions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {t(`contracts.${tab}`)}
              {tab === 'orders' && filteredOrders.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{filteredOrders.length}</span>
              )}
              {tab === 'positions' && filteredPositions.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{filteredPositions.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* 委托记录 */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              {filteredOrders.length === 0 ? (
                <div className="py-10 text-center">
                  <BarChart2 className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
                  <p className="text-[var(--text-muted)] text-sm">{t('contracts.noOrders')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-3 p-3 bg-[var(--card-hover)] rounded-xl"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        order.side === 'buy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {order.side === 'buy' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                            {order.side === 'buy' ? (isChinese ? '做多' : 'Long') : (isChinese ? '做空' : 'Short')}
                          </span>
                          <span className="text-sm text-[var(--text)] tabular-nums">{order.amount} {order.pair.split('/')[0]}</span>
                          <span className="text-xs text-[var(--text-muted)]">{order.leverage}x</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                          {isChinese ? '价格' : 'Price'}: {order.price} · {formatTime(order.timestamp)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <StatusBadge status={order.status} />
                        <p className="text-xs text-[var(--text-muted)] mt-1 tabular-nums">{order.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* 持仓 */}
        {activeTab === 'positions' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              {filteredPositions.length === 0 ? (
                <div className="py-10 text-center">
                  <BarChart2 className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
                  <p className="text-[var(--text-muted)] text-sm">{t('contracts.noPositions')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPositions.map((pos) => (
                    <div key={pos.id} className="p-4 bg-[var(--card-hover)] rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            pos.side === 'long' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {pos.side === 'long' ? t('contracts.positionLong') : t('contracts.positionShort')} {pos.leverage}x
                          </span>
                          <span className="text-sm font-medium text-[var(--text)]">{pos.size}</span>
                        </div>
                        <button
                          onClick={() => closeContractPosition(pos.id)}
                          className="px-3 py-1 bg-[var(--card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-muted)] hover:text-red-400 hover:border-red-400/50 transition-colors"
                        >
                          {t('contracts.positionClose')}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-[var(--text-muted)] mb-0.5">{isChinese ? '开仓价' : 'Entry'}</p>
                          <p className="text-[var(--text)] font-medium tabular-nums">{pos.entryPrice}</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)] mb-0.5">{isChinese ? '当前价' : 'Current'}</p>
                          <p className="text-[var(--text)] font-medium tabular-nums">{pos.currentPrice}</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)] mb-0.5">{isChinese ? '未实现盈亏' : 'Unrealized PnL'}</p>
                          <p className={`font-medium tabular-nums ${pos.unrealizedPnl.startsWith('+') ? 'text-green-400' : pos.unrealizedPnl.startsWith('-') ? 'text-red-400' : 'text-[var(--text)]'}`}>
                            {pos.unrealizedPnl}
                          </p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)] mb-0.5">{isChinese ? '保证金' : 'Margin'}</p>
                          <p className="text-[var(--text)] font-medium tabular-nums">{pos.margin}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Demo Banner */}
        <Card className="p-4 bg-green-500/5 border-green-500/20">
          <div className="flex items-start gap-3">
            <BarChart2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--text-muted)]">
              {isChinese
                ? 'Canton 合约交易演示模式 — 所有交易使用模拟数据，不涉及真实资产。'
                : 'Canton Contract Trading Demo — all trades use simulated data and involve no real assets.'}
            </p>
          </div>
        </Card>
      </div>

      {/* 下单弹窗 */}
      <AnimatePresence>
        {showOrderModal && (
          <PlaceOrderModal
            isOpen={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            pairId={selectedPairId}
            currentPrice={pair.currentPrice}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default ContractsPage;

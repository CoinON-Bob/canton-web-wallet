import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ArrowDown, 
  ArrowRight,
  ChevronDown, 
  Settings, 
  TrendingDown,
  TrendingUp,
  Check,
  Loader2,
  AlertCircle,
  Zap,
  Info
} from 'lucide-react';
import { useWalletStore } from '../store';
import { Card, PageTransition, PageHeader, Modal, useToast } from '../components/ui';
import type { Token, Transaction, TransactionStatus } from '../types';

// ==================== Swap 页面 ====================

export const SwapPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tokens, user, addTransaction, updateTransactionStatus } = useWalletStore();
  const { showToast } = useToast();
  
  // Form state
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[2]); // Default to BTC
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  
  // Settings
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  
  // UI state
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);
  
  // Transaction state
  const [showConfirm, setShowConfirm] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate exchange rate (mock)
  const exchangeRate = useMemo(() => {
    return toToken.price / fromToken.price;
  }, [fromToken, toToken]);

  // Calculate to amount when from amount changes
  useEffect(() => {
    if (fromAmount) {
      const calculated = parseFloat(fromAmount) * exchangeRate;
      setToAmount(calculated.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, exchangeRate]);

  // Calculate price impact (mock)
  const priceImpact = useMemo(() => {
    const amount = parseFloat(fromAmount) || 0;
    if (amount < 1000) return 0.1;
    if (amount < 10000) return 0.5;
    return 1.2;
  }, [fromAmount]);

  // Calculate minimum received
  const minimumReceived = useMemo(() => {
    if (!toAmount) return 0;
    return parseFloat(toAmount) * (1 - slippage / 100);
  }, [toAmount, slippage]);

  // Network fee
  const networkFee = 0.002;

  // Swap tokens
  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Max button
  const handleMax = () => {
    const balance = parseFloat(fromToken.balance.replace(/,/g, ''));
    setFromAmount(balance.toString());
  };

  // Validate
  const canSwap = parseFloat(fromAmount) > 0 && 
                  parseFloat(fromAmount) <= parseFloat(fromToken.balance.replace(/,/g, '')) &&
                  fromToken.symbol !== toToken.symbol;

  // Execute swap
  const handleSwap = async () => {
    if (!canSwap || !user) return;

    setIsProcessing(true);
    setTxStatus('Created');
    setShowConfirm(false);

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'Swap',
      hash: `CANTON::TX${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      amount: fromAmount,
      token: `${fromToken.symbol} → ${toToken.symbol}`,
      status: 'Created',
      from: user.walletAddress,
      to: 'Mock Wallet',
      fee: `${networkFee} CC`,
      timestamp: new Date().toISOString(),
      description: `Swap ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`
    };

    setCurrentTx(newTx);
    addTransaction(newTx);

    // Simulate transaction flow
    const steps: TransactionStatus[] = ['Signing', 'Broadcasted', 'Confirmed'];
    
    for (const status of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTxStatus(status);
      updateTransactionStatus(newTx.id, status);
      
      if (status === 'Confirmed') {
        showToast('Swap completed!', 'success');
      }
    }

    setIsProcessing(false);
    
    setTimeout(() => {
      navigate('/activity');
    }, 2000);
  };

  const handleCloseStatus = () => {
    if (txStatus === 'Confirmed' || txStatus === 'Failed') {
      setTxStatus(null);
      setCurrentTx(null);
      setFromAmount('');
      setToAmount('');
    }
  };

  // Token selector component
  const TokenSelector = ({ 
    selected, 
    onSelect, 
    isOpen, 
    onClose 
  }: { 
    selected: Token; 
    onSelect: (token: Token) => void;
    isOpen: boolean;
    onClose: () => void;
  }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-[#111118] border border-[var(--border)] rounded-xl overflow-hidden z-50 shadow-2xl"
        >
          <div className="max-h-64 overflow-y-auto">
            {tokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 hover:bg-[var(--card-hover)] transition-colors ${
                  selected.symbol === token.symbol ? 'bg-[var(--primary-subtle)]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{token.icon}</span>
                  <div className="text-left">
                    <p className="text-[var(--text)] font-medium">{token.symbol}</p>
                    <p className="text-xs text-[var(--text-muted)]">{token.name}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-[var(--text)]">{token.balance}</p>
                  <p className="text-xs text-[var(--text-muted)]">${token.valueUSD}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <PageTransition className="min-h-screen">
      <PageHeader 
        title={t('swap.title')} 
        subtitle={t('swap.subtitle')}
        rightAction={
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        }
      />
      
      <div className="p-4 lg:p-6 max-w-xl mx-auto">
        {/* From Token */}
        
        <Card className="p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-secondary)]">{t('swap.from')}</span>
            <span className="text-sm text-[var(--text-muted)]">
              {t('common.balance')}: {fromToken.balance} {fromToken.symbol}
            </span>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--card-hover)] border border-[var(--border)] rounded-xl text-2xl text-[var(--text)] placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowFromSelect(!showFromSelect)}
                className="flex items-center gap-2 px-3 py-3 bg-[var(--card-active)] hover:bg-[var(--card)]/15 rounded-xl transition-colors"
              >
                <span className="text-xl">{fromToken.icon}</span>
                <span className="text-[var(--text)] font-medium">{fromToken.symbol}</span>
                <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${showFromSelect ? 'rotate-180' : ''}`} />
              </button>
              
              <TokenSelector
                selected={fromToken}
                onSelect={setFromToken}
                isOpen={showFromSelect}
                onClose={() => setShowFromSelect(false)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-[var(--text-muted)]">
              ≈ ${(parseFloat(fromAmount || '0') * fromToken.price).toFixed(2)}
            </span>
            
            <button
              onClick={handleMax}
              className="text-sm text-[var(--primary)] hover:text-blue-300 font-medium"
            >
              MAX
            </button>
          </div>
        </Card>

        {/* Swap Button */}
        
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="p-3 bg-[#111118] border border-[var(--border)] rounded-full hover:bg-[var(--card-hover)] transition-colors active:scale-95 touch-manipulation"
          >
            <ArrowDown className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* To Token */}
        
        <Card className="p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-secondary)]">{t('swap.to')}</span>
            <span className="text-sm text-[var(--text-muted)]">
              {t('common.balance')}: {toToken.balance} {toToken.symbol}
            </span>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                readOnly
                placeholder="0.00"
                value={toAmount}
                className="w-full px-4 py-3 bg-[var(--card-hover)] border border-[var(--border)] rounded-xl text-2xl text-[var(--text)] placeholder-gray-600 cursor-not-allowed"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowToSelect(!showToSelect)}
                className="flex items-center gap-2 px-3 py-3 bg-[var(--card-active)] hover:bg-[var(--card)]/15 rounded-xl transition-colors"
              >
                <span className="text-xl">{toToken.icon}</span>
                <span className="text-[var(--text)] font-medium">{toToken.symbol}</span>
                <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${showToSelect ? 'rotate-180' : ''}`} />
              </button>
              
              <TokenSelector
                selected={toToken}
                onSelect={setToToken}
                isOpen={showToSelect}
                onClose={() => setShowToSelect(false)}
              />
            </div>
          </div>
          
          <div className="mt-2">
            <span className="text-sm text-[var(--text-muted)]">
              ≈ ${(parseFloat(toAmount || '0') * toToken.price).toFixed(2)}
            </span>
          </div>
        </Card>

        {/* Route Info */}
        
        {fromAmount && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Rate
              </span>
              <span className="text-[var(--text)]">
                1 {fromToken.symbol} ≈ {exchangeRate.toFixed(6)} {toToken.symbol}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Price Impact</span>
              <span className={`${priceImpact > 1 ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
                {priceImpact < 0.1 ? '<0.1%' : `${priceImpact.toFixed(2)}%`}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Minimum Received</span>
              <span className="text-[var(--text)]">
                {minimumReceived.toFixed(6)} {toToken.symbol}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Network Fee</span>
              <span className="text-[var(--text)]">{networkFee} CC</span>
            </div>
          </Card>
        )}

        {/* Swap Button */}
        
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!canSwap}
          className="w-full mt-4 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)] font-semibold rounded-xl transition-all active:scale-[0.98] touch-manipulation"
        >
          {!fromAmount ? 'Enter Amount' :
           fromToken.symbol === toToken.symbol ? 'Select Different Tokens' :
           parseFloat(fromAmount) > parseFloat(fromToken.balance.replace(/,/g, '')) 
             ? 'Insufficient Balance' 
             : 'Review Swap'}
        </button>
      </div>

      {/* Settings Modal */}
      
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title={t('swap.settings')}
        size="sm"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3">Slippage Tolerance</label>
            
            <div className="grid grid-cols-4 gap-2">
              {[0.1, 0.5, 1.0, 2.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    slippage === value 
                      ? 'bg-blue-500 text-[var(--text)]' 
                      : 'bg-[var(--card-hover)] text-[var(--text-secondary)] hover:bg-[var(--card-active)]'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
            
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Your transaction will revert if the price changes unfavorably by more than this percentage.
            </p>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      
      <Modal
        isOpen={showConfirm}
        onClose={() => !isProcessing && setShowConfirm(false)}
        title={t('swap.confirmSwap')}
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] bg-[var(--card-hover)] hover:bg-[var(--card-active)] rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSwap}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 text-sm text-[var(--text)] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Swapping...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Confirm Swap
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-[var(--card-hover)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--text-secondary)]">From</span>
              <span className="text-[var(--text)] font-semibold">{fromAmount} {fromToken.symbol}</span>
            </div>
            
            <div className="flex justify-center my-2">
              <ArrowDown className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">To</span>
              <span className="text-[var(--text)] font-semibold">{toAmount} {toToken.symbol}</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Rate</span>
              <span className="text-[var(--text)]">1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Slippage</span>
              <span className="text-[var(--text)]">{slippage}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Minimum Received</span>
              <span className="text-[var(--text)]">{minimumReceived.toFixed(6)} {toToken.symbol}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Network Fee</span>
              <span className="text-[var(--text)]">{networkFee} CC</span>
            </div>
          </div>
          
          {priceImpact > 1 && (
            <div className="bg-[var(--error-subtle)] border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--error)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--error)]">
                Price impact is high ({priceImpact.toFixed(2)}%). Consider reducing the amount or splitting into multiple swaps.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Transaction Status Modal */}
      
      <Modal
        isOpen={!!txStatus}
        onClose={handleCloseStatus}
        title={t('swap.txStatus')}
        size="sm"
        footer={
          txStatus === 'Confirmed' || txStatus === 'Failed' ? (
            <button
              onClick={handleCloseStatus}
              className="w-full px-4 py-2.5 text-sm text-[var(--text)] bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
            >
              {txStatus === 'Confirmed' ? 'View in Activity' : 'Close'}
            </button>
          ) : null
        }
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            {txStatus === 'Created' && (
              <div className="w-full h-full bg-blue-500/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
            {txStatus === 'Signing' && (
              <div className="w-full h-full bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[var(--warning)] animate-spin" />
              </div>
            )}
            {txStatus === 'Broadcasted' && (
              <div className="w-full h-full bg-purple-500/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {txStatus === 'Confirmed' && (
              <div className="w-full h-full bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-[var(--success)]" />
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-[var(--text)] mb-1">
            {txStatus === 'Created' && 'Creating Swap...'}
            {txStatus === 'Signing' && 'Signing Transaction...'}
            {txStatus === 'Broadcasted' && 'Confirming...'}
            {txStatus === 'Confirmed' && 'Swap Completed!'}
          </h3>
          
          <p className="text-sm text-[var(--text-muted)]">
            {currentTx && currentTx.description}
          </p>
          
          {currentTx && (
            <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">{currentTx.hash.slice(0, 20)}...{currentTx.hash.slice(-8)}</p>
          )}
        </div>
      </Modal>
    </PageTransition>
  );
};

export default SwapPage;
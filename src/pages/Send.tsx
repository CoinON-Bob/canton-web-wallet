import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  ChevronDown, 
  Clock, 
  Check,
  X,
  Loader2,
  User,
  Maximize2
} from 'lucide-react';
import { useWalletStore } from '../store';
import { Card, PageTransition, PageHeader, Modal, useToast } from '../components/ui';
import type { Token, Transaction, TransactionStatus } from '../types';

// ==================== Send 页面 ====================

export const SendPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tokens, user, addTransaction, updateTransactionStatus } = useWalletStore();
  const { showToast } = useToast();
  
  const [recipient, setRecipient] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const cantonAddressRegex = /^CANTON[a-zA-Z0-9]{38}$/;
    setIsValidAddress(cantonAddressRegex.test(recipient));
  }, [recipient]);

  const feeEstimate = useMemo(() => {
    const baseFee = 0.0015;
    const priorityFee = 0.0005;
    return {
      slow: { fee: baseFee, time: '~5 min' },
      standard: { fee: baseFee + priorityFee, time: '~2 min' },
      fast: { fee: baseFee + priorityFee * 2, time: '~30 sec' }
    };
  }, []);

  const selectedFee = feeEstimate.standard;

  const totalAmount = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    return amt + selectedFee.fee;
  }, [amount, selectedFee]);

  const handleMax = () => {
    const balance = parseFloat(selectedToken.balance.replace(/,/g, ''));
    const maxAmount = Math.max(0, balance - selectedFee.fee);
    setAmount(maxAmount.toFixed(6));
  };

  const canSubmit = isValidAddress && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(selectedToken.balance.replace(/,/g, ''));

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;

    setIsProcessing(true);
    setTxStatus('Created');
    setShowConfirm(false);

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'Send',
      hash: `CANTON::TX${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      amount: amount,
      token: selectedToken.symbol,
      status: 'Created',
      from: user.walletAddress,
      to: recipient,
      fee: `${selectedFee.fee} ETH`,
      timestamp: new Date().toISOString(),
      description: note || `${t('send.send')} ${amount} ${selectedToken.symbol}`
    };

    setCurrentTx(newTx);
    addTransaction(newTx);

    const steps: TransactionStatus[] = ['Signing', 'Broadcasted', 'Confirmed'];
    
    for (const status of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTxStatus(status);
      updateTransactionStatus(newTx.id, status);
      
      if (status === 'Confirmed') {
        showToast(t('send.txConfirmed'), 'success');
      }
    }

    setIsProcessing(false);
    setTimeout(() => navigate('/activity'), 2000);
  };

  const handleCloseStatus = () => {
    if (txStatus === 'Confirmed' || txStatus === 'Failed') {
      setTxStatus(null);
      setCurrentTx(null);
      setAmount('');
      setRecipient('');
      setNote('');
    }
  };

  const getButtonText = () => {
    if (parseFloat(amount) > parseFloat(selectedToken.balance.replace(/,/g, ''))) {
      return t('send.insufficientBalance');
    }
    if (!isValidAddress) {
      return t('send.enterValidAddress');
    }
    return t('send.review');
  };

  return (
    <PageTransition className="min-h-screen">
      <PageHeader title={t('send.title')} subtitle={t('send.subtitle')} />
      
      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        {/* Recipient Input */}
        
        <Card className="p-4">
          <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('send.recipient')}</label>
          
          <div className="relative">
            <input
              type="text"
              placeholder={t('send.recipientPlaceholder')}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--card-hover)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors font-mono text-sm"
            />
            
            {recipient && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidAddress ? (
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[var(--success)]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-[var(--error)]" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!isValidAddress && recipient && (
            <p className="text-xs text-[var(--error)] mt-2">{t('send.invalidAddress')}</p>
          )}
          
          <div className="mt-3 flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--card-hover)] hover:bg-[var(--card-active)] rounded-lg text-xs text-[var(--text-secondary)] transition-colors">
              <User className="w-3.5 h-3.5" />
              {t('send.contacts')}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--card-hover)] hover:bg-[var(--card-active)] rounded-lg text-xs text-[var(--text-secondary)] transition-colors">
              <Clock className="w-3.5 h-3.5" />
              {t('send.recent')}
            </button>
          </div>
        </Card>

        {/* Token & Amount */}
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm text-[var(--text-secondary)]">{t('send.token')}</label>
            
            <button
              onClick={() => setShowTokenSelect(!showTokenSelect)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--card-hover)] hover:bg-[var(--card-active)] rounded-lg transition-colors"
            >
              <span className="text-lg">{selectedToken.icon}</span>
              <span className="text-[var(--text)] font-medium">{selectedToken.symbol}</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${showTokenSelect ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <AnimatePresence>
            {showTokenSelect && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 space-y-1 overflow-hidden"
              >
                {tokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => {
                      setSelectedToken(token);
                      setShowTokenSelect(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedToken.symbol === token.symbol 
                        ? 'bg-[var(--primary-subtle)] border border-blue-500/20' 
                        : 'hover:bg-[var(--card-hover)]'
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
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <input
              type="number"
              placeholder={t('send.amountPlaceholder')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-4 bg-[var(--card-hover)] border border-[var(--border)] rounded-xl text-2xl text-[var(--text)] placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            
            <button
              onClick={handleMax}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--primary-subtle)] hover:bg-blue-500/20 text-[var(--primary)] text-sm font-medium rounded-lg transition-colors"
            >
              {t('send.max')}
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-sm">
            <p className="text-[var(--text-muted)]">
              {t('common.balance')}: {selectedToken.balance} {selectedToken.symbol}
            </p>
            <p className="text-[var(--text-muted)]">
              ≈ ${(parseFloat(amount || '0') * selectedToken.price).toFixed(2)}
            </p>
          </div>
        </Card>

        {/* Fee Estimate */}
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-secondary)]">{t('send.networkFee')}</span>
            </div>
            
            <div className="text-right">
              <p className="text-[var(--text)]">{selectedFee.fee} ETH</p>
              <p className="text-xs text-[var(--text-muted)]">{selectedFee.time}</p>
            </div>
          </div>
        </Card>

        {/* Note */}
        
        <Card className="p-4">
          <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('send.note')}</label>
          
          <input
            type="text"
            placeholder={t('send.notePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--card-hover)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </Card>

        {/* Submit Button */}
        
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!canSubmit}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)] font-semibold rounded-xl transition-all active:scale-[0.98] touch-manipulation"
        >
          {getButtonText()}
        </button>
      </div>

      {/* Confirm Modal */}
      
      <Modal
        isOpen={showConfirm}
        onClose={() => !isProcessing && setShowConfirm(false)}
        title={t('send.confirmTitle')}
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] bg-[var(--card-hover)] hover:bg-[var(--card-active)] rounded-xl transition-colors disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 text-sm text-[var(--text)] bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('send.processing')}
                </>
              ) : (
                <>
                  {t('common.confirm')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-[var(--card-hover)] rounded-xl p-4">
            <p className="text-sm text-[var(--text-muted)] mb-1">{t('send.send')}</p>
            <p className="text-2xl font-bold text-[var(--text)]">{amount} {selectedToken.symbol}</p>
            <p className="text-sm text-[var(--text-muted)]">≈ ${(parseFloat(amount || '0') * selectedToken.price).toFixed(2)}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">{t('send.to')}</span>
              <span className="text-[var(--text)] font-mono">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">{t('send.networkFee')}</span>
              <span className="text-[var(--text)]">{selectedFee.fee} ETH</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">{t('send.estimatedTime')}</span>
              <span className="text-[var(--text)]">{selectedFee.time}</span>
            </div>
          </div>
          
          <div className="border-t border-[var(--border)] pt-3">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">{t('common.total')}</span>
              <div className="text-right">
                <p className="text-[var(--text)] font-semibold">{totalAmount.toFixed(6)} {selectedToken.symbol}</p>
                <p className="text-xs text-[var(--text-muted)]">+ {selectedFee.fee} ETH {t('common.fee').toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Transaction Status Modal */}
      
      <Modal
        isOpen={!!txStatus}
        onClose={handleCloseStatus}
        title={t('send.txStatus')}
        size="sm"
        footer={
          txStatus === 'Confirmed' || txStatus === 'Failed' ? (
            <button
              onClick={handleCloseStatus}
              className="w-full px-4 py-2.5 text-sm text-[var(--text)] bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
            >
              {txStatus === 'Confirmed' ? t('common.view') : t('common.close')}
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
            {txStatus === 'Created' && t('send.txCreated')}
            {txStatus === 'Signing' && t('send.txSigning')}
            {txStatus === 'Broadcasted' && t('send.txBroadcasted')}
            {txStatus === 'Confirmed' && t('send.txConfirmed')}
          </h3>
          
          <p className="text-sm text-[var(--text-muted)]">
            {currentTx && `${currentTx.amount} ${currentTx.token} ${t('send.to')} ${currentTx.to.slice(0, 6)}...${currentTx.to.slice(-4)}`}
          </p>
          
          {currentTx && (
            <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">{currentTx.hash.slice(0, 20)}...{currentTx.hash.slice(-8)}</p>
          )}
        </div>
      </Modal>
    </PageTransition>
  );
};

export default SendPage;
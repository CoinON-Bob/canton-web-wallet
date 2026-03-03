import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronDown, 
  Wallet, 
  Clock, 
  AlertCircle,
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
  const navigate = useNavigate();
  const { tokens, user, addTransaction, updateTransactionStatus } = useWalletStore();
  const { showToast } = useToast();
  
  // Form state
  const [recipient, setRecipient] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  // UI state
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);
  
  // Transaction state
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Validate Ethereum address
  useEffect(() => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    setIsValidAddress(ethAddressRegex.test(recipient));
  }, [recipient]);

  // Calculate fee estimate (mock)
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

  // Calculate total
  const totalAmount = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    return amt + selectedFee.fee;
  }, [amount, selectedFee]);

  // Max button handler
  const handleMax = () => {
    const balance = parseFloat(selectedToken.balance.replace(/,/g, ''));
    const maxAmount = Math.max(0, balance - selectedFee.fee);
    setAmount(maxAmount.toFixed(6));
  };

  // Validate form
  const canSubmit = isValidAddress && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(selectedToken.balance.replace(/,/g, ''));

  // Submit transaction
  const handleSubmit = async () => {
    if (!canSubmit || !user) return;

    setIsProcessing(true);
    setTxStatus('Created');
    setShowConfirm(false);

    // Create transaction record
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'Send',
      hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      amount: amount,
      token: selectedToken.symbol,
      status: 'Created',
      from: user.walletAddress,
      to: recipient,
      fee: `${selectedFee.fee} ETH`,
      timestamp: new Date().toISOString(),
      description: note || `Send ${amount} ${selectedToken.symbol}`
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
        showToast('Transaction confirmed!', 'success');
        // Update token balance
        const newBalance = parseFloat(selectedToken.balance.replace(/,/g, '')) - parseFloat(amount);
        // In real app, would call updateTokenBalance here
      }
    }

    setIsProcessing(false);
    
    // Navigate to activity after success
    setTimeout(() => {
      navigate('/activity');
    }, 2000);
  };

  // Close modal and reset
  const handleCloseStatus = () => {
    if (txStatus === 'Confirmed' || txStatus === 'Failed') {
      setTxStatus(null);
      setCurrentTx(null);
      setAmount('');
      setRecipient('');
      setNote('');
    }
  };

  return (
    <PageTransition className="min-h-screen">
      <PageHeader title="Send" subtitle="Transfer assets to any address" />
      
      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        {/* Recipient Input */}
        
        <Card className="p-4">
          <label className="block text-sm text-gray-400 mb-2">Recipient Address</label>
          
          <div className="relative">
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors font-mono text-sm"
            />
            
            {recipient && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidAddress ? (
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!isValidAddress && recipient && (
            <p className="text-xs text-red-400 mt-2">Invalid Ethereum address</p>
          )}
          
          {/* Contact placeholder */}
          
          <div className="mt-3 flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 transition-colors">
              <User className="w-3.5 h-3.5" />
              Contacts
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 transition-colors">
              <Clock className="w-3.5 h-3.5" />
              Recent
            </button>
          </div>
        </Card>

        {/* Token & Amount */}
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm text-gray-400">Token</label>
            
            <button
              onClick={() => setShowTokenSelect(!showTokenSelect)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="text-lg">{selectedToken.icon}</span>
              <span className="text-white font-medium">{selectedToken.symbol}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTokenSelect ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {/* Token Selector Dropdown */}
          
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
                        ? 'bg-blue-500/10 border border-blue-500/20' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{token.icon}</span>
                      <div className="text-left">
                        <p className="text-white font-medium">{token.symbol}</p>
                        <p className="text-xs text-gray-500">{token.name}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-white">{token.balance}</p>
                      <p className="text-xs text-gray-500">${token.valueUSD}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Amount Input */}
          
          <div className="relative">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-2xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            
            <button
              onClick={handleMax}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium rounded-lg transition-colors"
            >
              MAX
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-sm">
            <p className="text-gray-500">
              Balance: {selectedToken.balance} {selectedToken.symbol}
            </p>
            <p className="text-gray-500">
              ≈ ${(parseFloat(amount || '0') * selectedToken.price).toFixed(2)}
            </p>
          </div>
        </Card>

        {/* Fee Estimate */}
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Network Fee</span>
            </div>
            
            <div className="text-right">
              <p className="text-white">{selectedFee.fee} ETH</p>
              <p className="text-xs text-gray-500">{selectedFee.time}</p>
            </div>
          </div>
        </Card>

        {/* Note */}
        <Card className="p-4">
          <label className="block text-sm text-gray-400 mb-2">Note (Optional)</label>
          
          <input
            type="text"
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </Card>

        {/* Submit Button */}
        
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!canSubmit}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all active:scale-[0.98] touch-manipulation"
        >
          {parseFloat(amount) > parseFloat(selectedToken.balance.replace(/,/g, '')) 
            ? 'Insufficient Balance' 
            : !isValidAddress 
              ? 'Enter Valid Address' 
              : 'Review Transaction'}
        </button>
      </div>

      {/* Confirm Modal */}
      
      <Modal
        isOpen={showConfirm}
        onClose={() => !isProcessing && setShowConfirm(false)}
        title="Confirm Transaction"
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Send</p>
            <p className="text-2xl font-bold text-white">{amount} {selectedToken.symbol}</p>
            <p className="text-sm text-gray-500">≈ ${(parseFloat(amount || '0') * selectedToken.price).toFixed(2)}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">To</span>
              <span className="text-white font-mono">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Network Fee</span>
              <span className="text-white">{selectedFee.fee} ETH</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Time</span>
              <span className="text-white">{selectedFee.time}</span>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <div className="text-right">
                <p className="text-white font-semibold">{totalAmount.toFixed(6)} {selectedToken.symbol}</p>
                <p className="text-xs text-gray-500">+ {selectedFee.fee} ETH fee</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Transaction Status Modal */}
      
      <Modal
        isOpen={!!txStatus}
        onClose={handleCloseStatus}
        title="Transaction Status"
        size="sm"
        footer={
          txStatus === 'Confirmed' || txStatus === 'Failed' ? (
            <button
              onClick={handleCloseStatus}
              className="w-full px-4 py-2.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
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
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
              </div>
            )}
            {txStatus === 'Broadcasted' && (
              <div className="w-full h-full bg-purple-500/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {txStatus === 'Confirmed' && (
              <div className="w-full h-full bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-400" />
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-1">
            {txStatus === 'Created' && 'Creating Transaction...'}
            {txStatus === 'Signing' && 'Signing...'}
            {txStatus === 'Broadcasted' && 'Broadcasting...'}
            {txStatus === 'Confirmed' && 'Transaction Confirmed!'}
          </h3>
          
          <p className="text-sm text-gray-500">
            {currentTx && `${currentTx.amount} ${currentTx.token} to ${currentTx.to.slice(0, 6)}...${currentTx.to.slice(-4)}`}
          </p>
          
          {currentTx && (
            <p className="text-xs text-gray-600 mt-2 font-mono">{currentTx.hash.slice(0, 20)}...{currentTx.hash.slice(-8)}</p>
          )}
        </div>
      </Modal>
    </PageTransition>
  );
};

export default SendPage;
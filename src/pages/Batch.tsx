import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Check, 
  AlertCircle,
  Loader2,
  ChevronDown,
  FileSpreadsheet,
  Users,
  ArrowRight,
  X,
  Copy
} from 'lucide-react';
import { useWalletStore } from '../store';
import { Card, PageTransition, PageHeader, Modal, useToast, Tag } from '../components/ui';
import type { Token, BatchTransfer, BatchRecipient } from '../types';

// ==================== Batch 页面 ====================

interface RecipientRow {
  id: string;
  address: string;
  amount: string;
  status?: 'pending' | 'success' | 'failed';
  error?: string;
}

export const BatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { tokens, user, addBatchTransfer, updateBatchStatus } = useWalletStore();
  const { showToast } = useToast();
  
  // Form state
  const [recipients, setRecipients] = useState<RecipientRow[]>([
    { id: '1', address: '', amount: '' },
    { id: '2', address: '', amount: '' }
  ]);
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);
  const [batchName, setBatchName] = useState('');
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<BatchTransfer | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  // Calculations
  const validRecipients = useMemo(() => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return recipients.filter(r => ethAddressRegex.test(r.address) && parseFloat(r.amount) > 0);
  }, [recipients]);

  const totalAmount = useMemo(() => {
    return validRecipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  }, [validRecipients]);

  const hasDuplicates = useMemo(() => {
    const addresses = validRecipients.map(r => r.address.toLowerCase());
    return new Set(addresses).size !== addresses.length;
  }, [validRecipients]);

  // Add row
  const addRow = () => {
    setRecipients(prev => [...prev, { 
      id: Date.now().toString(), 
      address: '', 
      amount: '' 
    }]);
  };

  // Remove row
  const removeRow = (id: string) => {
    if (recipients.length <= 1) return;
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  // Update row
  const updateRow = (id: string, field: keyof RecipientRow, value: string) => {
    setRecipients(prev => prev.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  // Clear all
  const clearAll = () => {
    setRecipients([{ id: Date.now().toString(), address: '', amount: '' }]);
  };

  // CSV Import
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      const newRecipients: RecipientRow[] = [];
      let hasHeader = true;
      
      // Detect if first line is header
      const firstLine = lines[0]?.toLowerCase() || '';
      if (firstLine.includes('address') || firstLine.includes('amount')) {
        hasHeader = true;
      } else {
        hasHeader = false;
      }
      
      const startIndex = hasHeader ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Support both comma and tab separated
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        
        if (parts.length >= 2) {
          newRecipients.push({
            id: `csv_${i}`,
            address: parts[0].trim(),
            amount: parts[1].trim()
          });
        }
      }
      
      if (newRecipients.length > 0) {
        setRecipients(newRecipients);
        showToast(`Imported ${newRecipients.length} recipients`, 'success');
      } else {
        showToast('No valid recipients found in CSV', 'error');
      }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // CSV Export template
  const downloadTemplate = () => {
    const csv = 'address,amount\n0x1234...5678,100\n0xabcd...efgh,50';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Execute batch
  const handleExecute = async () => {
    if (!user || validRecipients.length === 0) return;

    setIsProcessing(true);
    setShowProgress(true);

    const batchRecipients: BatchRecipient[] = validRecipients.map(r => ({
      address: r.address,
      amount: r.amount,
      status: 'pending'
    }));

    const newBatch: BatchTransfer = {
      id: `batch_${Date.now()}`,
      name: batchName || `Batch Transfer ${new Date().toLocaleDateString()}`,
      total: validRecipients.length,
      success: 0,
      failed: 0,
      status: 'Processing',
      createdAt: new Date().toISOString(),
      token: selectedToken.symbol,
      recipients: batchRecipients,
      totalAmount: totalAmount.toString()
    };

    setCurrentBatch(newBatch);
    addBatchTransfer(newBatch);

    // Simulate batch processing
    const total = validRecipients.length;
    let success = 0;
    let failed = 0;

    for (let i = 0; i < total; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 90% success rate simulation
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        success++;
        batchRecipients[i].status = 'success';
        batchRecipients[i].txHash = `0x${Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)).join('')}`;
      } else {
        failed++;
        batchRecipients[i].status = 'failed';
        batchRecipients[i].error = 'Insufficient gas or network error';
      }
      
      setProgress(Math.round(((i + 1) / total) * 100));
      
      // Update batch status
      const status = failed > 0 ? 'Partial Failed' : 
                     success === total ? 'Completed' : 'Processing';
      updateBatchStatus(newBatch.id, status);
    }

    setCurrentBatch(prev => prev ? {
      ...prev,
      success,
      failed,
      status: failed > 0 ? 'Partial Failed' : 'Completed'
    } : null);

    setIsProcessing(false);
    showToast(
      `Batch completed: ${success} success, ${failed} failed`,
      failed > 0 ? 'info' : 'success'
    );
  };

  // Validate address
  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  return (
    <PageTransition className="min-h-screen">
      <PageHeader 
        title="Batch Transfer" 
        subtitle="Send to multiple addresses at once"
      />
      
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
        {/* Header Card */}
        
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">Batch Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g., March Salary"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            
            <div className="sm:w-48">
              <label className="block text-sm text-gray-400 mb-2">Token</label>
              
              <div className="relative">
                <button
                  onClick={() => setShowTokenSelect(!showTokenSelect)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{selectedToken.icon}</span>
                    {selectedToken.symbol}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTokenSelect ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showTokenSelect && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#111118] border border-white/10 rounded-xl overflow-hidden z-50"
                    >
                      {tokens.map(token => (
                        <button
                          key={token.symbol}
                          onClick={() => {
                            setSelectedToken(token);
                            setShowTokenSelect(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-xl">{token.icon}</span>
                          <span className="text-white">{token.symbol}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* CSV Actions */}
          
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg cursor-pointer transition-colors"
          >
              <Upload className="w-4 h-4" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />
            </label>
            
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
            
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </Card>

        {/* Recipients Table */}
        
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {validRecipients.length} valid / {recipients.length} total
              </span>
            </div>
            
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>
          
          <div className="max-h-96 overflow-auto">
            <table className="w-full">
              <thead className="bg-white/5 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400"># </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Recipient Address </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Amount ({selectedToken.symbol})</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-white/5">
                {recipients.map((recipient, index) => (
                  <tr key={recipient.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="0x..."
                          value={recipient.address}
                          onChange={(e) => updateRow(recipient.id, 'address', e.target.value)}
                          className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-sm font-mono text-white placeholder-gray-600 focus:outline-none transition-colors ${
                            recipient.address && !isValidAddress(recipient.address)
                              ? 'border-red-500/50'
                              : isValidAddress(recipient.address)
                                ? 'border-green-500/50'
                                : 'border-white/10 focus:border-blue-500/50'
                          }`}
                        />
                        
                        {recipient.address && isValidAddress(recipient.address) && (
                          <Check className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={recipient.amount}
                        onChange={(e) => updateRow(recipient.id, 'amount', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeRow(recipient.id)}
                        disabled={recipients.length <= 1}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Summary */}
        
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Total Recipients:</span>
                <span className="text-white font-medium">{validRecipients.length}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Total Amount:</span>
                <span className="text-white font-medium">
                  {totalAmount.toFixed(6)} {selectedToken.symbol}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Balance:</span>
                <span className={`font-medium ${
                  totalAmount > parseFloat(selectedToken.balance.replace(/,/g, '')) 
                    ? 'text-red-400' 
                    : 'text-green-400'
                }`}>
                  {selectedToken.balance} {selectedToken.symbol}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleExecute}
              disabled={validRecipients.length === 0 || isProcessing || totalAmount > parseFloat(selectedToken.balance.replace(/,/g, ''))}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all active:scale-[0.98] touch-manipulation flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : totalAmount > parseFloat(selectedToken.balance.replace(/,/g, '')) ? (
                'Insufficient Balance'
              ) : validRecipients.length === 0 ? (
                'Add Valid Recipients'
              ) : (
                <>
                  Execute Batch
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
          
          {hasDuplicates && (
            <div className="mt-3 flex items-start gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Warning: Duplicate addresses detected. The same address appears multiple times in the list.</span>
            </div>
          )}
        </Card>
      </div>

      {/* Progress Modal */}
      
      <Modal
        isOpen={showProgress}
        onClose={() => {}}
        title="Batch Progress"
        size="sm"
        footer={
          !isProcessing && currentBatch ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowProgress(false);
                  navigate('/activity');
                }}
                className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  setShowProgress(false);
                  setCurrentBatch(null);
                  setProgress(0);
                }}
                className="flex-1 px-4 py-2.5 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          ) : null
        }
      >
        <div className="space-y-4">
          {/* Progress Bar */}
          
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-medium">{progress}%</span>
          </div>
          
          {/* Stats */}
          
          {currentBatch && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-lg font-semibold text-white">{currentBatch.total}</p>
              </div>
              
              <div className="bg-green-500/10 rounded-xl p-3 text-center">
                <p className="text-xs text-green-400">Success</p>
                <p className="text-lg font-semibold text-green-400">{currentBatch.success}</p>
              </div>
              
              <div className="bg-red-500/10 rounded-xl p-3 text-center">
                <p className="text-xs text-red-400">Failed</p>
                <p className="text-lg font-semibold text-red-400">{currentBatch.failed}</p>
              </div>
            </div>
          )}
          
          {/* Status */}
          
          {currentBatch && !isProcessing && (
            <div className="text-center">
              <Tag 
                variant={currentBatch.status === 'Completed' ? 'success' : 'warning'}
                className="text-sm"
              >
                {currentBatch.status}
              </Tag>
            </div>
          )}
          
          {/* Processing Indicator */}
          
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing transactions...</span>
            </div>
          )}
        </div>
      </Modal>
    </PageTransition>
  );
};

export default BatchPage;
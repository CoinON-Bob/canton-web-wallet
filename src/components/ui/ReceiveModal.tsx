import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Wallet, DollarSign, FileText, QrCode as QrIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { shortAddress } from '../../utils/address';
import { Card } from './index';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  onCopy: () => void;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({ 
  isOpen, 
  onClose, 
  address,
  onCopy 
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'qr' | 'address'>('qr');

  // Generate QR code
  useEffect(() => {
    if (!isOpen || !address) return;

    const generateQR = async () => {
      try {
        // Build URI with optional amount and note
        let uri = `ethereum:${address}`;
        const params = new URLSearchParams();
        if (amount) params.append('value', amount);
        if (note) params.append('memo', note);
        
        const queryString = params.toString();
        if (queryString) {
          uri += '?' + queryString;
        }

        const dataUrl = await QRCode.toDataURL(uri, {
          width: 280,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('QR generation failed:', err);
      }
    };

    generateQR();
  }, [isOpen, address, amount, note]);

  // Handle touch gestures for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -minSwipeDistance;
    if (isDownSwipe) {
      onClose();
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-8)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 sm:fixed sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Card className="bg-[var(--bg-elevated)] border-[var(--border)] rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-auto sm:max-w-md sm:w-full">
              {/* Handle bar for mobile */}
              
              <div className="w-12 h-1 bg-[var(--border-strong)] rounded-full mx-auto mb-6 sm:hidden" />

              {/* Header */}
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--success-subtle)] rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text)]">Receive</h3>
                    <p className="text-sm text-[var(--text-muted)]">Share your address to receive funds</p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[var(--card)] rounded-lg transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
              </div>

              {/* Tab Switcher */}
              
              <div className="flex bg-[var(--card)] rounded-xl p-1 mb-6">
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all touch-manipulation ${
                    activeTab === 'qr' 
                      ? 'bg-[var(--card-hover)] text-[var(--text)]' 
                      : 'text-[var(--text-muted)] hover:text-gray-300'
                  }`}
                >
                  <QrIcon className="w-4 h-4" />
                  QR Code
                </button>
                
                <button
                  onClick={() => setActiveTab('address')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all touch-manipulation ${
                    activeTab === 'address' 
                      ? 'bg-[var(--card-hover)] text-[var(--text)]' 
                      : 'text-[var(--text-muted)] hover:text-gray-300'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Address
                </button>
              </div>

              {/* QR Code Tab */}
              
              {activeTab === 'qr' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Amount Input (Optional) */}
                  
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="Amount (optional)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* Note Input (Optional) */}
                  
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                      <FileText className="w-4 h-4" />
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Note (optional)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>

                  {/* QR Code Display */}
                  
                  <div className="flex justify-center py-4">
                    <div className="bg-white p-4 rounded-2xl">
                      {qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt="QR Code" 
                          className="w-64 h-64"
                        />
                      ) : (
                        <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-lg" />
                      )}
                    </div>
                  </div>

                  <p className="text-center text-sm text-[var(--text-muted)]">
                    Scan with any wallet app to send funds
                  </p>
                </motion.div>
              )}

              {/* Address Tab */}
              
              {activeTab === 'address' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-xs text-[var(--text-muted)] mb-2">Your Wallet Address</p>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-[var(--text)] font-mono break-all flex-1">{address}</p>
                      
                      <button
                        onClick={onCopy}
                        className="p-2.5 bg-[var(--primary-subtle)] hover:bg-[var(--primary)]/20 rounded-xl transition-colors touch-manipulation flex-shrink-0"
                        title="Copy address"
                      >
                        <Copy className="w-5 h-5 text-[var(--primary)]" />
                      </button>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-2 font-mono">
                      {shortAddress(address, 8, 6)}
                    </p>
                  </div>

                  <div className="bg-[var(--warning-subtle)] border border-[var(--warning)]/20 rounded-xl p-4">
                    <p className="text-sm text-[var(--warning)]">
                      ⚠️ Only send assets on Canton Network to this address. 
                      Sending from other networks may result in permanent loss.
                    </p>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReceiveModal;
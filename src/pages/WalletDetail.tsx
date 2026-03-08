import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Card, Button, Input, PageTransition, useToast } from '../components/ui';
import { walletApi, type WalletDetail as WalletDetailType } from '../utils/api';

export const WalletDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchWallet = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await walletApi.get(id);
      setWallet(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [id]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !toWalletId.trim() || !amount.trim()) return;
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) {
      setTransferError('Enter a valid positive amount');
      return;
    }
    setTransferring(true);
    setTransferError(null);
    try {
      await walletApi.transfer(id, toWalletId.trim(), num);
      showToast('Transfer successful', 'success');
      setAmount('');
      setToWalletId('');
      await fetchWallet();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setTransferError(msg);
      showToast(msg, 'error');
    } finally {
      setTransferring(false);
    }
  };

  if (!id) {
    return (
      <PageTransition className="p-4">
        <p className="text-[var(--text-muted)]">Invalid wallet</p>
        <Button variant="ghost" className="mt-2" onClick={() => navigate('/wallets')}>
          Back to list
        </Button>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition className="p-4">
        <Card className="p-8 text-center text-[var(--text-muted)]">Loading...</Card>
      </PageTransition>
    );
  }

  if (error || !wallet) {
    return (
      <PageTransition className="p-4">
        <p className="text-red-400">{error || 'Wallet not found'}</p>
        <Button variant="ghost" className="mt-2" onClick={() => navigate('/wallets')}>
          Back to list
        </Button>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm">
        Mock Node mode. Not connected to real Canton network.
      </div>
      <button
        onClick={() => navigate('/wallets')}
        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Wallet List
      </button>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Wallet Detail</h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-[var(--text-muted)]">Mock Wallet ID</dt>
            <dd className="font-mono text-[var(--text)] break-all mt-0.5">{wallet.id}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Mock Account ID</dt>
            <dd className="font-mono text-[var(--text)] break-all mt-0.5">
              {wallet.nodeAccountId ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Wallet Balance (Mock)</dt>
            <dd className="text-[var(--text)] font-medium mt-0.5">
              {wallet.balance ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">Mode</dt>
            <dd className="text-[var(--text)] mt-0.5">Mock</dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-[var(--text)] mb-4">Transfer</h3>
        <form onSubmit={handleTransfer} className="space-y-4">
          <Input
            label="To Wallet (Mock Wallet ID)"
            value={toWalletId}
            onChange={(e) => setToWalletId(e.target.value)}
            placeholder="Destination wallet UUID"
          />
          <Input
            label="Amount"
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
          {transferError && (
            <p className="text-sm text-red-400">{transferError}</p>
          )}
          <Button type="submit" disabled={transferring} isLoading={transferring}>
            Submit Transfer
          </Button>
        </form>
      </Card>
    </PageTransition>
  );
};

export default WalletDetailPage;

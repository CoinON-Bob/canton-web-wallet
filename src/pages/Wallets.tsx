import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Plus, ChevronRight } from 'lucide-react';
import { Card, Button, PageTransition, EmptyState, useToast } from '../components/ui';
import { walletApi, type WalletItem } from '../utils/api';

export const WalletsPage: React.FC = () => {
  const [list, setList] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await walletApi.list();
      setList(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      if (msg.includes('401')) {
        showToast('Please log in again', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const w = await walletApi.create();
      showToast('Wallet created', 'success');
      setList((prev) => [...prev, { ...w, balance: undefined }]);
      navigate(`/wallets/${w.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageTransition className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm">
        Current mode: Mock Node. Not connected to real Canton network.
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">Wallets</h1>
        <Button
          onClick={handleCreate}
          disabled={creating}
          isLoading={creating}
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Create Wallet
        </Button>
      </div>

      {error && !loading && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="p-8 text-center text-[var(--text-muted)]">
          Loading...
        </Card>
      ) : list.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<Wallet className="w-8 h-8" />}
            title="No wallets yet"
            description="Create a wallet to get started."
            action={
              <Button onClick={handleCreate} disabled={creating} isLoading={creating}>
                <Plus className="w-4 h-4" />
                Create Wallet
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {list.map((w) => (
            <motion.li
              key={w.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/wallets/${w.id}`}>
                <Card hover className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text)] truncate">
                        {w.label || `Wallet ${w.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] font-mono truncate" title="Mock Wallet ID">
                        Mock Wallet ID: {w.id.slice(0, 8)}…
                      </p>
                      {w.balance !== undefined && (
                        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                          Wallet Balance (Mock): {w.balance}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                </Card>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </PageTransition>
  );
};

export default WalletsPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { useWalletStore } from '../store';
import { emailVerificationApi } from '../utils/api';
import { usersApi } from '../utils/api';

export const VerifyEmailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setUser } = useWalletStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fromQuery = searchParams.get('email');
    if (fromQuery) setEmail(fromQuery);
    else if (user?.email) setEmail(user.email);
  }, [searchParams, user?.email]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setSendLoading(true);
    try {
      const { ok, data } = await emailVerificationApi.send(email.trim());
      if (ok && (data as { success?: boolean }).success) {
        setSendSuccess(true);
        const d = data as { devCode?: string };
        if (d.devCode) setDevCode(d.devCode);
      } else {
        setError((data as { message?: string }).message || 'Failed to send code');
      }
    } catch {
      setError('Network error');
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !code.trim() || code.trim().length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setVerifyLoading(true);
    try {
      const { ok, data } = await emailVerificationApi.verify(email.trim(), code.trim());
      if (ok && (data as { success?: boolean }).success) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('canton_access_token') : null;
        if (token) {
          const me = await usersApi.getMe();
          setUser({
            id: me.id,
            email: me.email,
            emailVerified: true,
            isAuthenticated: true,
          });
        }
        navigate('/wallets');
        return;
      }
      setError((data as { message?: string }).message || 'Invalid or expired code');
    } catch {
      setError('Network error');
    } finally {
      setVerifyLoading(false);
    }
  };

  if (user && user.isAuthenticated && user.emailVerified) {
    navigate('/wallets', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4" />
      </div>

      <motion.div
        className="w-full max-w-[400px] relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--primary)]/10 rounded-2xl mb-4 text-[var(--primary)]">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {t('verifyEmail.title', 'Verify your email')}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {t('verifyEmail.subtitle', 'Enter the 6-digit code sent to your email. In development the code is shown below after you request it.')}
          </p>
        </div>

        <motion.div
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {!sendSuccess ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('verifyEmail.email', 'Email')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 pl-11 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={sendLoading}
                className="w-full py-3 bg-[var(--primary)] hover:opacity-90 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
                {t('verifyEmail.sendCode', 'Send verification code')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Code sent to <strong className="text-[var(--text)]">{email}</strong>
              </p>
              {devCode && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm">
                  Development: your code is <strong className="font-mono">{devCode}</strong>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('verifyEmail.code', '6-digit code')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-center text-[var(--text)] font-mono text-lg tracking-widest placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={verifyLoading || code.length !== 6}
                className="w-full py-3 bg-[var(--primary)] hover:opacity-90 text-white font-medium rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {t('verifyEmail.verify', 'Verify')}
              </button>
              <button
                type="button"
                onClick={() => { setSendSuccess(false); setCode(''); setError(''); setDevCode(null); }}
                className="w-full py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                {t('verifyEmail.requestNew', 'Request new code')}
              </button>
            </form>
          )}

          <p className="text-center mt-6">
            <Link to="/login" className="text-sm text-[var(--primary)] hover:underline">
              {t('verifyEmail.backToLogin', 'Back to login')}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;

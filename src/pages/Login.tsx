import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../store';
import { Button, Input, Card, PageTransition } from '../components/ui';

// ==================== 图标 ====================

const Icons = {
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Loading: () => (
    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

// ==================== 登录页面 ====================

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { setUser } = useWalletStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!email && !password) {
      // Demo mode
      setUser({
        email: 'institutional@canton.network',
        walletAddress: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        isAuthenticated: true
      });
    } else if (email && password) {
      setUser({
        email,
        walletAddress: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        isAuthenticated: true
      });
    } else {
      setError('Please enter both email and password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background decorations - subtle gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
      </div>

      <motion.div 
        className="w-full max-w-[400px] relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-5 shadow-lg shadow-blue-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-4xl font-bold text-white">C</span>
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-1">Canton Wallet</h1>
          <p className="text-gray-400 text-base">{t('login.subtitle')}</p>
          <p className="text-gray-500 text-xs mt-1">Built on Canton Network</p>
        </div>

        {/* Login Card */}
        <motion.div 
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">{t('login.title')}</h2>
            <p className="text-gray-400 text-sm">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('login.email')}</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Icons.Mail />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('login.password')}</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Icons.Lock />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-medium rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icons.Loading />
                  {t('login.signingIn')}
                </>
              ) : (
                t('login.signIn')
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setEmail('institutional@canton.network');
                  setPassword('demo123');
                }}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Use demo credentials
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                <Icons.Lock />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-300 mb-0.5">{t('settings.security')}</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Enterprise-grade security with multi-signature protection
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2024 Canton Network. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;

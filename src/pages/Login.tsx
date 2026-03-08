import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useWalletStore } from '../store';
import { authApi } from '../utils/api';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Globe, ChevronDown } from 'lucide-react';

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

// ==================== 语言切换组件 ====================

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];
  
  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
        aria-label="切换语言"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLang.flag} {currentLang.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--bg-elevated)] border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-3 py-2.5 text-sm text-left hover:bg-white/5 transition-colors flex items-center gap-2 ${
                  i18n.language === lang.code ? 'bg-green-500/10 text-green-400' : 'text-slate-300'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ==================== 登录页面 ====================

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useWalletStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError(t('login.errors.required'));
      return;
    }
    setIsLoading(true);
    try {
      const { ok, data } = await authApi.login(email, password);
      if (!ok || !(data as { access_token?: string }).access_token) {
        setError((data as { message?: string }).message || t('login.errors.required'));
        setIsLoading(false);
        return;
      }
      const token = (data as { access_token: string }).access_token;
      const userPayload = (data as { user?: { id?: string; email?: string; emailVerified?: boolean } }).user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('canton_access_token', token);
      }
      setUser({
        id: userPayload?.id,
        email: userPayload?.email ?? email,
        emailVerified: userPayload?.emailVerified ?? false,
        isAuthenticated: true,
      });
      const redirect = searchParams.get('redirect');
      if (userPayload?.emailVerified === false) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        navigate(redirect || '/wallets');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('institutional@canton.network');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden grain-overlay">
      {/* 语言切换控件 - 右上角 */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      
      {/* Background - Bright green gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-green-400/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl mb-5 shadow-xl shadow-green-500/30"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-4xl font-bold text-slate-900 font-display">C</span>
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-1 font-display tracking-tight">Canton Wallet</h1>
          <p className="text-slate-400 text-base">{t('login.subtitle')}</p>
          <p className="text-slate-500 text-xs mt-1">Built on Canton Network</p>
        </div>

        {/* Login Card - Glassmorphism */}
        <motion.div 
          className="glass-strong rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">{t('login.title')}</h2>
            <p className="text-gray-400 text-sm">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱 */}
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all text-sm"
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-400">{t('login.password')}</label>
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Icons.Lock />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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

            {/* 登录按钮 - Bright Green CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
            >
              {isLoading ? (
                <>
                  <Icons.Loading />
                  {t('login.signingIn')}
                </>
              ) : (
                <>
                  {t('login.signIn')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Demo 账号按钮 */}
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {t('login.useDemo')}
            </button>
          </form>

          {/* 分隔线 */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-gray-500">{t('login.or')}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* 注册入口 */}
          <p className="text-center text-gray-400">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              {t('login.signUp')}
            </Link>
          </p>

          {/* Terms & Privacy */}
          <p className="text-center mt-4">
            <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              {t('common.termsPrivacy')}
            </Link>
          </p>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/15 rounded-xl">
              <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400">
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
          © {new Date().getFullYear()} Canton Network. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;

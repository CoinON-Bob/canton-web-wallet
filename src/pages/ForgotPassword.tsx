import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react';

// ==================== ForgotPassword 页面 ====================

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('forgotPassword.errors.emailInvalid'));
      return;
    }
    
    setIsLoading(true);
    
    // 模拟 API 调用（占位）
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
      </div>

      <motion.div 
        className="w-full max-w-[420px] relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.img
            src="/canton-logo.jpg"
            alt="Canton Logo"
            className="w-20 h-20 rounded-2xl object-cover mb-5 shadow-lg mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          />
          <h1 className="text-3xl font-bold text-[var(--text)] mb-1">{t('forgotPassword.title')}</h1>
          <p className="text-[var(--text-muted)] text-base">{!isSubmitted ? t('forgotPassword.subtitle') : t('forgotPassword.checkEmail')}</p>
        </div>

        {/* 内容卡片 */}
        <motion.div 
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* 返回登录 */}
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('forgotPassword.backToLogin')}
          </Link>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-4 bg-[var(--primary-subtle)] rounded-xl">
                <p className="text-sm text-[var(--text-secondary)]">
                  {t('forgotPassword.instruction')}
                </p>
              </div>

              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('forgotPassword.email')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 pl-11 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                {error && (
                  <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-medium rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t('forgotPassword.sending')}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t('forgotPassword.sendLink')}
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
                {t('forgotPassword.emailSent')}
              </h3>
              
              <p className="text-[var(--text-secondary)] mb-6">
                {t('forgotPassword.emailSentDesc', { email })}
              </p>

              <button
                onClick={() => setIsSubmitted(false)}
                className="text-[var(--primary)] hover:underline text-sm"
              >
                {t('forgotPassword.resend')}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
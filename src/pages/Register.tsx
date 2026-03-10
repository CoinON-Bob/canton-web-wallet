import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useWalletStore } from '../store';
import { authApi } from '../utils/api';
import { Mail, Lock, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useWalletStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = t('register.errors.emailRequired');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('register.errors.emailInvalid');
    }
    if (!formData.password) {
      newErrors.password = t('register.errors.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('register.errors.passwordTooShort');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.errors.passwordMismatch');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const { ok: regOk, data: regData } = await authApi.register(formData.email, formData.password);
      if (!regOk && (regData as { statusCode?: number }).statusCode === 409) {
        setErrors({ email: t('register.errors.emailExists', 'Email already registered') });
        setIsLoading(false);
        return;
      }
      if (!regOk) {
        setErrors({ email: (regData as { message?: string }).message || 'Registration failed' });
        setIsLoading(false);
        return;
      }
      const { ok: loginOk, data: loginData } = await authApi.login(formData.email, formData.password);
      if (!loginOk || !(loginData as { access_token?: string }).access_token) {
        setErrors({ email: 'Registration succeeded but login failed. Please log in manually.' });
        setIsLoading(false);
        return;
      }
      const token = (loginData as { access_token: string }).access_token;
      const userPayload = (loginData as { user?: { id?: string; email?: string; emailVerified?: boolean } }).user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('canton_access_token', token);
      }
      setUser({
        id: userPayload?.id,
        email: userPayload?.email ?? formData.email,
        emailVerified: userPayload?.emailVerified ?? false,
        isAuthenticated: true,
      });
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch {
      setErrors({ email: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
      </div>

      <motion.div
        className="w-full max-w-[420px] relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="text-center mb-8">
          <motion.img
            src="/canton-logo.jpg"
            alt="Canton Logo"
            className="w-20 h-20 rounded-2xl object-cover mb-5 shadow-lg mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          />
          <h1 className="text-3xl font-bold text-[var(--text)] mb-1">{t('register.title')}</h1>
          <p className="text-[var(--text-muted)] text-base">{t('register.subtitle')}</p>
        </div>

        <motion.div
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('register.backToLogin')}
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('register.email')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('register.emailPlaceholder')}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 pl-11 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-green-500/50 transition-colors"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('register.password')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('register.passwordPlaceholder')}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 pl-11 pr-11 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-green-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>}
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">{t('register.passwordHint')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('register.confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 pl-11 pr-11 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-green-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              {isLoading ? t('register.creatingAccount') : t('register.createAccount')}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-sm text-[var(--text-muted)]">{t('register.or')}</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <p className="text-center text-[var(--text-secondary)]">
            {t('register.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-[var(--primary)] hover:underline">
              {t('register.signIn')}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

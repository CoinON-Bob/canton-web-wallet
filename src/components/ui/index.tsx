import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ==================== Button 组件 ====================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const { t } = useTranslation();
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variantStyles = {
    primary: "bg-[var(--primary)] text-[var(--text-inverse)] hover:bg-[var(--primary-600)] shadow-[var(--shadow-sm)]",
    secondary: "bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)]",
    outline: "bg-transparent text-[var(--primary)] border border-[var(--primary)]/30 hover:bg-[var(--primary-subtle)]",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--card)]"
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          {t('common.loading')}
        </>
      ) : children}
    </button>
  );
};

// ==================== Card 组件 ====================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick
}) => {
  return (
    <div
      className={`rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-sm)] ${
        hover ? 'cursor-pointer hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow)]' : ''
      } transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// ==================== Input 组件 ====================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{icon}</div>
        )}
        <input
          className={`w-full bg-[var(--input)] border ${
            error ? 'border-[var(--error)]/50 focus:border-[var(--error)]' : 'border-[var(--input-border)] focus:border-[var(--primary)]'
          } rounded-xl px-4 py-3 ${icon ? 'pl-12' : ''} text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  );
};

// ==================== Tag 组件 ====================

interface TagProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const variants = {
    success: 'bg-[var(--success-subtle)] text-[var(--success)] border border-[var(--success)]/20',
    warning: 'bg-[var(--warning-subtle)] text-[var(--warning)] border border-[var(--warning)]/20',
    error: 'bg-[var(--error-subtle)] text-[var(--error)] border border-[var(--error)]/20',
    info: 'bg-[var(--info-subtle)] text-[var(--info)] border border-[var(--info)]/20',
    default: 'bg-[var(--card)] text-[var(--text-secondary)] border border-[var(--border)]'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-lg ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ==================== Modal 组件 ====================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--modal-backdrop)] backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className={`relative bg-[var(--modal)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-xl)] w-full ${sizes[size]} max-h-[90vh] overflow-hidden`}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--card)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--card)]">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ==================== Empty State 组件 ====================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    {icon && (
      <div className="w-16 h-16 bg-[var(--card)] rounded-2xl flex items-center justify-center mb-4 text-[var(--text-muted)]">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{title}</h3>
    <p className="text-[var(--text-secondary)] max-w-sm mb-6">{description}</p>
    {action && <div>{action}</div>}
  </div>
);

// ==================== Page Transition 组件 ====================

export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

// ==================== Loading Skeleton 组件 ====================

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[var(--card)] rounded-lg ${className}`} />
);

// ==================== Stat Card 组件 ====================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  positive = true,
  icon
}) => (
  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:bg-[var(--card-hover)] transition-colors">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-[var(--text-muted)]">{title}</p>
      {icon && <div className="text-[var(--text-secondary)]">{icon}</div>}
    </div>
    <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
    {change && (
      <p className={`text-sm mt-1 ${positive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
        {positive ? '↑' : '↓'} {change}
      </p>
    )}
  </div>
);

// Re-export from Toast
export { Toast, ToastManager, useToast } from './Toast';
export { ReceiveModal } from './ReceiveModal';
export { PageHeader } from './PageHeader';

import React from 'react';
import { motion } from 'framer-motion';

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
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-blue-500/20",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    outline: "bg-transparent text-blue-400 border border-blue-500/30 hover:bg-blue-500/10",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
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
          Loading...
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
      className={`bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 ${
        hover ? 'cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.12]' : ''
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
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
        )}
        <input
          className={`w-full bg-white/5 border ${
            error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'
          } rounded-xl px-4 py-3 ${icon ? 'pl-12' : ''} text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-red-500/10' : 'focus:ring-blue-500/10'
          } transition-all ${className}`}
          {...props}
        />
      </div>      
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
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
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    default: 'bg-white/5 text-gray-400 border border-white/10'
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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />      
      <motion.div
        className={`relative bg-[#111118] border border-white/10 rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden`}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>          
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
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
          <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02]">
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
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-gray-500">
        {icon}
      </div>
    )}    
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>    
    <p className="text-gray-500 max-w-sm mb-6">{description}</p>    
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
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
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
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-500">{title}</p>
      {icon && <div className="text-gray-400">{icon}</div>}
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    {change && (
      <p className={`text-sm mt-1 ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {positive ? '↑' : '↓'} {change}
      </p>
    )}
  </div>
);

// Re-export from Toast
export { Toast, ToastManager, useToast } from './Toast';
export { ReceiveModal } from './ReceiveModal';
export { PageHeader } from './PageHeader';

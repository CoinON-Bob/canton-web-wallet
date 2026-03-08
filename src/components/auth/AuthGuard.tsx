import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWalletStore } from '../../store';

// ==================== AuthGuard: 保护需要登录的路由 ====================

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user } = useWalletStore();
  const location = useLocation();

  if (!user || !user.isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  if (user.emailVerified === false) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email)}`} replace />;
  }

  return <>{children}</>;
};

// ==================== PublicOnlyGuard: 已登录用户不能访问登录/注册页 ====================

interface PublicOnlyGuardProps {
  children: React.ReactNode;
}

export const PublicOnlyGuard: React.FC<PublicOnlyGuardProps> = ({ children }) => {
  const { user } = useWalletStore();
  const location = useLocation();

  if (user && user.isAuthenticated) {
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect');
    if (user.emailVerified === false) {
      return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email)}`} replace />;
    }
    return <Navigate to={redirect || '/wallets'} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
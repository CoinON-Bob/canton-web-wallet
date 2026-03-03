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
  
  if (!user) {
    // 未登录，跳转到登录页，并记录原页面路径
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} 
        replace 
      />
    );
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
  
  if (user) {
    // 已登录，检查是否有 redirect 参数
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect');
    
    // 有 redirect 就跳回去，否则去 dashboard
    return <Navigate to={redirect || '/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

export default AuthGuard;
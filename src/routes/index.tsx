import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useWalletStore } from '../store';
import { MainLayout } from '../components/layout';
import { 
  LoginPage, 
  DashboardPage, 
  AssetsPage, 
  SendPage, 
  SwapPage, 
  BatchPage, 
  OffersPage, 
  ActivityPage, 
  SettingsPage,
  MarketPage,
  MarketDetailPage
} from '../pages';

// ==================== 路由守卫组件 ====================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useWalletStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// ==================== 公共路由组件 ====================

const PublicRoutes: React.FC = () => {
  const { user } = useWalletStore();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// ==================== 受保护路由组件 ====================

const AppRoutes: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/send" element={<SendPage />} />
        <Route path="/swap" element={<SwapPage />} />
        <Route path="/batch" element={<BatchPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/market/:symbol" element={<MarketDetailPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};

// ==================== 主路由组件 ====================

export const Router: React.FC = () => {
  const { user } = useWalletStore();
  
  return (
    <BrowserRouter>
      {user ? (
        <ProtectedRoute>
          <AppRoutes />
        </ProtectedRoute>
      ) : (
        <PublicRoutes />
      )}
    </BrowserRouter>
  );
};

export default Router;

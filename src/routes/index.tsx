import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PlaceholderPage } from '../pages/Placeholder';
import { AuthGuard, PublicOnlyGuard } from '../components/auth/AuthGuard';
import { MainLayout } from '../components/layout';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  DashboardPage,
  AssetsPage,
  SendPage,
  SwapPage,
  BatchPage,
  OffersPage,
  ActivityPage,
  SettingsPage,
  MarketPage,
  MarketDetailPage,
  DiscoverPage,
  ContractsPage
} from '../pages';

// Settings pages
import { SettingsLayoutFixed } from '../components/layout/SettingsLayoutFixed';
import { SettingsAccountPage } from '../pages/settings/AccountPage';
import { SettingsAddressBookPage } from '../pages/settings/AddressBookPage';
import { SettingsNotificationsPage } from '../pages/settings/NotificationsPage';
import { SettingsInvitePage } from '../pages/settings/InvitePage';

// ==================== Settings 占位组件 ====================

const SettingsPlaceholder: React.FC<{ titleKey: string }> = ({ titleKey }) => {
  const { t, i18n } = useTranslation();
  const desc = i18n.language === 'zh'
    ? '该功能正在开发中，敬请期待。'
    : 'This feature is under development, coming soon.';
  return <PlaceholderPage title={t(titleKey)} description={desc} />;
};

// ==================== 主路由组件 ====================

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公共路由 - 未登录才能访问 */}
        <Route 
          path="/login" 
          element={
            <PublicOnlyGuard>
              <LoginPage />
            </PublicOnlyGuard>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicOnlyGuard>
              <RegisterPage />
            </PublicOnlyGuard>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicOnlyGuard>
              <ForgotPasswordPage />
            </PublicOnlyGuard>
          } 
        />

        {/* 受保护路由 - 需要登录 */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </AuthGuard>
          }
        />
        
        <Route
          path="/assets"
          element={
            <AuthGuard>
              <MainLayout>
                <AssetsPage />
              </MainLayout>
            </AuthGuard>
          }
        />
        
        <Route
          path="/send"
          element={
            <AuthGuard>
              <MainLayout>
                <SendPage />
              </MainLayout>
            </AuthGuard>
          }
        />
        
        <Route
          path="/swap"
          element={
            <AuthGuard>
              <MainLayout>
                <SwapPage />
              </MainLayout>
            </AuthGuard>
          }
        />
        
        <Route
          path="/batch"
          element={
            <AuthGuard>
              <MainLayout>
                <BatchPage />
              </MainLayout>
            </AuthGuard>
          }
        />
        
        <Route
          path="/offers"
          element={
            <AuthGuard>
              <MainLayout>
                <OffersPage />
              </MainLayout>
            </AuthGuard>
          }
        />
        
        <Route
          path="/activity"
          element={
            <AuthGuard>
              <MainLayout>
                <ActivityPage />
              </MainLayout>
            </AuthGuard>
          }
        />
        
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <MainLayout>
                <SettingsLayoutFixed />
              </MainLayout>
            </AuthGuard>
          }
        >
          <Route index element={<div />} /> {/* 空元素，SettingsLayoutNew 会处理 */}
          <Route path="account" element={<SettingsAccountPage />} />
          <Route path="address-book" element={<SettingsAddressBookPage />} />
          <Route path="private-key" element={<SettingsPlaceholder titleKey="settings.privateKey" />} />
          <Route path="notifications" element={<SettingsNotificationsPage />} />
          <Route path="invite" element={<SettingsInvitePage />} />
          <Route path="rewards" element={<SettingsPlaceholder titleKey="settings.rewards" />} />
          <Route path="currency" element={<SettingsPlaceholder titleKey="settings.currency" />} />
          <Route path="one-step-transfer" element={<SettingsPlaceholder titleKey="settings.oneStepTransfer" />} />
          <Route path="utxo-management" element={<SettingsPlaceholder titleKey="settings.utxoManagement" />} />
          <Route path="security" element={<SettingsPlaceholder titleKey="settings.security" />} />
          <Route path="help" element={<SettingsPlaceholder titleKey="settings.helpCenter" />} />
          <Route path="terms" element={<SettingsPlaceholder titleKey="settings.termsPrivacy" />} />
          <Route path="feedback" element={<SettingsPlaceholder titleKey="settings.feedback" />} />
        </Route>
        
        <Route
          path="/market"
          element={
            <AuthGuard>
              <MainLayout>
                <MarketPage />
              </MainLayout>
            </AuthGuard>
          }
        />
        
        <Route
          path="/market/:symbol"
          element={
            <AuthGuard>
              <MainLayout>
                <MarketDetailPage />
              </MainLayout>
            </AuthGuard>
          }
        />
        
        <Route
          path="/discover"
          element={
            <AuthGuard>
              <MainLayout>
                <DiscoverPage />
              </MainLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/contracts"
          element={
            <AuthGuard>
              <MainLayout>
                <ContractsPage />
              </MainLayout>
            </AuthGuard>
          }
        />

        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
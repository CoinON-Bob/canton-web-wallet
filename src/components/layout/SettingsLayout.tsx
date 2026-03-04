import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  User,
  Book,
  Key,
  Bell,
  Users,
  Gift,
  DollarSign,
  Repeat,
  Database,
  Shield,
  HelpCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { Card } from '../ui';

// ==================== 设置菜单项 ====================

const settingsMenuItems = [
  {
    id: 'account',
    labelKey: 'settings.accountManagement',
    descriptionKey: 'settings.accountManagementDesc',
    icon: User,
    path: '/settings/account',
  },
  {
    id: 'address-book',
    labelKey: 'settings.addressBook',
    descriptionKey: 'settings.addressBookDesc',
    icon: Book,
    path: '/settings/address-book',
  },
  {
    id: 'private-key',
    labelKey: 'settings.privateKey',
    descriptionKey: 'settings.privateKeyDesc',
    icon: Key,
    path: '/settings/private-key',
  },
  {
    id: 'notifications',
    labelKey: 'settings.notifications',
    descriptionKey: 'settings.notificationsDesc',
    icon: Bell,
    path: '/settings/notifications',
  },
  {
    id: 'invite',
    labelKey: 'settings.inviteFriend',
    descriptionKey: 'settings.inviteFriendDesc',
    icon: Users,
    path: '/settings/invite',
  },
  {
    id: 'rewards',
    labelKey: 'settings.rewards',
    descriptionKey: 'settings.rewardsDesc',
    icon: Gift,
    path: '/settings/rewards',
  },
  {
    id: 'currency',
    labelKey: 'settings.currency',
    descriptionKey: 'settings.currencyDesc',
    icon: DollarSign,
    path: '/settings/currency',
  },
  {
    id: 'one-step-transfer',
    labelKey: 'settings.oneStepTransfer',
    descriptionKey: 'settings.oneStepTransferDesc',
    icon: Repeat,
    path: '/settings/one-step-transfer',
  },
  {
    id: 'utxo-management',
    labelKey: 'settings.utxoManagement',
    descriptionKey: 'settings.utxoManagementDesc',
    icon: Database,
    path: '/settings/utxo-management',
  },
  {
    id: 'security',
    labelKey: 'settings.twoFactorAuth',
    descriptionKey: 'settings.twoFactorAuthDesc',
    icon: Shield,
    path: '/settings/security',
  },
  {
    id: 'help',
    labelKey: 'settings.helpCenter',
    descriptionKey: 'settings.helpCenterDesc',
    icon: HelpCircle,
    path: '/settings/help',
  },
  {
    id: 'terms',
    labelKey: 'settings.termsPrivacy',
    descriptionKey: 'settings.termsPrivacyDesc',
    icon: FileText,
    path: '/settings/terms',
  },
  {
    id: 'feedback',
    labelKey: 'settings.feedback',
    descriptionKey: 'settings.feedbackDesc',
    icon: MessageSquare,
    path: '/settings/feedback',
  },
];

// ==================== 设置布局组件 ====================

export const SettingsLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isSettingsRoot = location.pathname === '/settings';

  return (
    <div className="min-h-screen">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* 返回按钮和标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/settings"
              className="p-2 hover:bg-[var(--card)] rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text)]">
                {t('settings.title')}
              </h1>
              <p className="text-[var(--text-muted)]">
                {t('settings.subtitle')}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧菜单 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-4">
              <nav className="space-y-1">
                {settingsMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                          : 'hover:bg-[var(--card-hover)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-[var(--primary)]/10'
                          : 'bg-[var(--card)]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{t(item.labelKey)}</div>
                        <div className="text-xs opacity-75 truncate">
                          {t(item.descriptionKey)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </Card>
          </motion.div>

          {/* 右侧内容区域 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {isSettingsRoot ? (
              <Card className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">⚙️</span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
                  {t('settings.title')}
                </h2>
                <p className="text-[var(--text-muted)] mb-6">
                  {t('settings.subtitle')}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Select a setting from the menu to configure your account
                </p>
              </Card>
            ) : (
              <Outlet />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
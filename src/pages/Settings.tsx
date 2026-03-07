import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon,
  ChevronRight,
  LogOut,
  AlertTriangle,
  Check,
  Mail,
  Wallet,
  Key,
  Languages,
  Users,
  BookOpen,
  Gift,
  CreditCard,
  Zap,
  FileText,
  HelpCircle,
  ShieldCheck,
  Lock,
  MessageSquare,
  Star,
  DollarSign,
  RefreshCw,
  Database
} from 'lucide-react';
import { useWalletStore } from '../store';
import { shortAddress } from '../utils/address';
import { Card, PageTransition, PageHeader, Modal, useToast } from '../components/ui';

// ==================== 设置项类型定义 ====================

interface SettingItem {
  id: string;
  title: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  icon: React.ComponentType<any>;
  path?: string;
  action?: () => void;
  badge?: string;
  badgeColor?: string;
  isDanger?: boolean;
  isComingSoon?: boolean;
}

// ==================== 设置页面 ====================

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, setUser, toggleHideBalance, hideBalance, theme, toggleTheme } = useWalletStore();
  const { showToast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isChinese = i18n.language === 'zh';
  
  // 语言选项
  const languageOptions = [
    { value: 'zh', label: '中文(简体)' },
    { value: 'en', label: 'English' }
  ];
  
  // 货币选项
  const currencyOptions = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'CNY', label: 'CNY (¥)', symbol: '¥' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' }
  ];
  
  // 用户偏好
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    hideBalances: hideBalance,
    darkMode: theme === 'dark',
    language: i18n.language === 'zh' ? 'zh' : 'en',
    currency: 'USD'
  });
  
  // 处理设置项点击
  const handleSettingClick = (item: SettingItem) => {
    if (item.isComingSoon) {
      showToast(
        isChinese ? `${item.title} 功能即将开放` : `${item.title} feature is coming soon`,
        'info'
      );
      return;
    }
    
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };
  
  // 处理登出
  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };
  
  // 切换偏好设置
  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'hideBalances') {
      toggleHideBalance();
    }
    if (key === 'darkMode') {
      toggleTheme();
    }
    if (key === 'language') {
      // 语言切换已在 LanguageSwitcher 中处理
      return;
    }
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  // 更改语言
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setPreferences(prev => ({ ...prev, language: lang }));
  };
  
  // 更改货币
  const changeCurrency = (currency: string) => {
    setPreferences(prev => ({ ...prev, currency }));
    showToast(
      isChinese ? `货币已更改为 ${currency}` : `Currency changed to ${currency}`,
      'success'
    );
  };
  
  // 地址格式化
  const formatAddress = (addr: string) => shortAddress(addr, 6, 4);
  
  // ==================== 设置项配置 ====================
  
  // 账户管理组
  const accountSettings: SettingItem[] = [
    {
      id: 'account-management',
      title: 'Account Management',
      titleKey: 'settings.accountManagement',
      description: 'Manage your account details and preferences',
      descriptionKey: 'settings.accountManagementDesc',
      icon: User,
      isComingSoon: true
    },
    {
      id: 'address-book',
      title: 'Address Book',
      titleKey: 'settings.addressBook',
      description: 'Save and manage frequently used addresses',
      descriptionKey: 'settings.addressBookDesc',
      icon: BookOpen,
      isComingSoon: true
    },
    {
      id: 'private-key',
      title: 'Private Key',
      titleKey: 'settings.privateKey',
      description: 'View and export your private key (secure)',
      descriptionKey: 'settings.privateKeyDesc',
      icon: Key,
      isComingSoon: true
    },
    {
      id: 'notifications',
      title: 'Notifications',
      titleKey: 'settings.notifications',
      description: 'Configure email and push notifications',
      descriptionKey: 'settings.notificationsDesc',
      icon: Bell,
      action: () => showToast(
        isChinese ? '通知设置即将开放' : 'Notification settings coming soon',
        'info'
      )
    },
  ];
  
  // 社交与奖励组
  const socialSettings: SettingItem[] = [
    {
      id: 'invite-friend',
      title: 'Invite a Friend',
      titleKey: 'settings.inviteFriend',
      description: 'Invite friends and earn rewards',
      descriptionKey: 'settings.inviteFriendDesc',
      icon: Users,
      isComingSoon: true
    },
    {
      id: 'rewards',
      title: 'Rewards',
      titleKey: 'settings.rewards',
      description: 'View and claim your rewards',
      descriptionKey: 'settings.rewardsDesc',
      icon: Gift,
      isComingSoon: true
    },
  ];
  
  // 偏好设置组
  const preferenceSettings: SettingItem[] = [
    {
      id: 'currency',
      title: 'Currency',
      titleKey: 'settings.currency',
      description: 'Set your preferred display currency',
      descriptionKey: 'settings.currencyDesc',
      icon: DollarSign,
      action: () => {
        // 这里可以打开货币选择模态框
        showToast(
          isChinese ? '货币选择功能即将开放' : 'Currency selection coming soon',
          'info'
        )
      }
    },
    {
      id: 'one-step-transfer',
      title: 'One-step Transfer',
      titleKey: 'settings.oneStepTransfer',
      description: 'Quick transfer with predefined settings',
      descriptionKey: 'settings.oneStepTransferDesc',
      icon: Zap,
      isComingSoon: true
    },
    {
      id: 'utxo-management',
      title: 'UTXO Management',
      titleKey: 'settings.utxoManagement',
      description: 'Manage Unspent Transaction Outputs',
      descriptionKey: 'settings.utxoManagementDesc',
      icon: Database,
      isComingSoon: true
    },
  ];
  
  // 安全设置组
  const securitySettings: SettingItem[] = [
    {
      id: 'two-factor-auth',
      title: 'Two-Factor Authentication',
      titleKey: 'settings.twoFactorAuth',
      description: 'Add an extra layer of security',
      descriptionKey: 'settings.twoFactorAuthDesc',
      icon: ShieldCheck,
      isComingSoon: true
    },
    {
      id: 'session-management',
      title: 'Session Management',
      titleKey: 'settings.sessionManagement',
      description: 'View and manage active sessions',
      descriptionKey: 'settings.sessionManagementDesc',
      icon: Lock,
      isComingSoon: true
    },
  ];
  
  // 支持与关于组
  const supportSettings: SettingItem[] = [
    {
      id: 'help-center',
      title: 'Help Center',
      titleKey: 'settings.helpCenter',
      description: 'Get help and browse FAQs',
      descriptionKey: 'settings.helpCenterDesc',
      icon: HelpCircle,
      isComingSoon: true
    },
    {
      id: 'terms-privacy',
      title: 'Terms & Privacy',
      titleKey: 'settings.termsPrivacy',
      description: 'View our terms of service and privacy policy',
      descriptionKey: 'settings.termsPrivacyDesc',
      icon: FileText,
      isComingSoon: true
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      titleKey: 'settings.feedback',
      description: 'Share your thoughts with us',
      descriptionKey: 'settings.feedbackDesc',
      icon: MessageSquare,
      isComingSoon: true
    },
  ];
  
  // ==================== 设置项组件 ====================
  
  const SettingItemComponent: React.FC<{ item: SettingItem }> = ({ item }) => {
    const Icon = item.icon;
    const title = item.titleKey ? t(item.titleKey) : item.title;
    const description = item.descriptionKey ? t(item.descriptionKey) : item.description;
    
    return (
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={() => handleSettingClick(item)}
          className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-colors ${
            item.isDanger 
              ? 'hover:bg-red-500/10 text-red-400' 
              : item.isComingSoon
                ? 'hover:bg-[var(--card-hover)] text-[var(--text-muted)]'
                : 'hover:bg-[var(--card-hover)] text-[var(--text)]'
          }`}
          disabled={item.isComingSoon}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            item.isDanger 
              ? 'bg-red-500/10' 
              : item.isComingSoon
                ? 'bg-[var(--card)]'
                : 'bg-[var(--primary-subtle)]'
          }`}>
            <Icon className={`w-5 h-5 ${
              item.isDanger 
                ? 'text-red-400' 
                : item.isComingSoon
                  ? 'text-[var(--text-muted)]'
                  : 'text-[var(--primary)]'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{title}</h3>
              {item.badge && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${item.badgeColor || 'bg-green-500/10 text-green-400'}`}>
                  {item.badge}
                </span>
              )}
              {item.isComingSoon && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-400">
                  {isChinese ? '即将开放' : 'Coming Soon'}
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-0.5 truncate">{description}</p>
          </div>
          
          <ChevronRight className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
        </button>
      </motion.div>
    );
  };
  
  // ==================== 设置组组件 ====================
  
  const SettingsGroup: React.FC<{ 
    title: string; 
    titleKey?: string;
    items: SettingItem[];
    className?: string;
  }> = ({ title, titleKey, items, className }) => (
    <div className={className}>
      <h2 className="text-lg font-semibold text-[var(--text)] mb-3 truncate">
        {titleKey ? t(titleKey) : title}
      </h2>
      <Card className="divide-y divide-[var(--border)]">
        {items.map((item) => (
          <SettingItemComponent key={item.id} item={item} />
        ))}
      </Card>
    </div>
  );
  
  // ==================== 主渲染 ====================
  
  return (
    <PageTransition className="min-h-screen">
      <PageHeader 
        title={t('settings.title')} 
        subtitle={t('settings.subtitle')} 
      />
      
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        {/* 用户信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-[var(--text)] truncate">
                  {user?.email}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {isChinese ? '机构账户' : 'Institutional Account'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--card)] px-2 py-1 rounded">
                    {formatAddress(user?.walletAddress || '')}
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded">
                    {isChinese ? '已验证' : 'Verified'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* 设置分组 */}
        <div className="space-y-8">
          <SettingsGroup
            title="Account"
            titleKey="settings.account"
            items={accountSettings}
          />
          
          <SettingsGroup
            title="Social & Rewards"
            titleKey="settings.socialRewards"
            items={socialSettings}
          />
          
          <SettingsGroup
            title="Preferences"
            titleKey="settings.preferences"
            items={preferenceSettings}
          />
          
          <SettingsGroup
            title="Security"
            titleKey="settings.security"
            items={securitySettings}
          />
          
          <SettingsGroup
            title="Support & About"
            titleKey="settings.supportAbout"
            items={supportSettings}
          />
          
          {/* 登出按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-4">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t('common.logout')}</span>
              </button>
            </Card>
          </motion.div>
        </div>
        
        {/* 版本信息 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Canton Wallet v1.0.0 • {isChinese ? '基于 Canton 网络构建' : 'Built on Canton Network'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            © {new Date().getFullYear()} Canton Network. {isChinese ? '保留所有权利' : 'All rights reserved'}.
          </p>
        </div>
      </div>
      
      {/* 登出确认模态框 */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title={t('common.logout')}
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-xl transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-3 text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
            >
              {t('common.confirmLogout')}
            </button>
          </div>
        }
      >
        <p className="text-[var(--text-muted)] text-sm">
          {t('common.logoutDesc', 'You will need to sign in again to access your wallet.')}
        </p>
      </Modal>
    </PageTransition>
  );
};

export default SettingsPage;
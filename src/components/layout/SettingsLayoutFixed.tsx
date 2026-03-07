import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft,
  Key,
  Bell,
  DollarSign,
  Repeat,
  Database,
  HelpCircle,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Card } from '../ui';

const BUILD_HASH = '33b4c68';

// ==================== 设置菜单项 ====================

// Settings menu: 1 通知 2 私钥 3 货币 4 一步转账 5 UTXO 管理 6 帮助中心 7 发送反馈
const settingsMenuItems = [
  {
    id: 'notifications',
    labelKey: 'settings.notifications',
    descriptionKey: 'settings.notificationsDesc',
    icon: Bell,
    path: '/settings/notifications',
  },
  {
    id: 'private-key',
    labelKey: 'settings.privateKey',
    descriptionKey: 'settings.privateKeyDesc',
    icon: Key,
    path: '/settings/private-key',
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
    id: 'help',
    labelKey: 'settings.helpCenter',
    descriptionKey: 'settings.helpCenterDesc',
    icon: HelpCircle,
    path: '/settings/help',
  },
  {
    id: 'feedback',
    labelKey: 'settings.feedback',
    descriptionKey: 'settings.feedbackDesc',
    icon: MessageSquare,
    path: '/settings/feedback',
  },
];

// ==================== 响应式 Hook ====================

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

// ==================== 移动端设置列表页 ====================

const MobileSettingsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleItemClick = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="min-h-screen p-4">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {t('settings.title')}
        </h1>
        <p className="text-[var(--text-muted)]">
          {t('settings.subtitle')}
        </p>
      </motion.div>
      
      {/* 设置列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="p-2">
          <nav className="space-y-1">
            {settingsMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * index }}
                >
                  <button
                    onClick={() => handleItemClick(item.path)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
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
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium truncate">{t(item.labelKey)}</div>
                      <div className="text-xs opacity-75 truncate">
                        {t(item.descriptionKey)}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-50" />
                  </button>
                </motion.div>
              );
            })}
          </nav>
        </Card>
      </motion.div>
      
      {/* Build Hash 显示 */}
      <div className="mt-8 pt-4 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--text-muted)] font-mono">
          Build: {BUILD_HASH}
        </p>
      </div>
    </div>
  );
};

// ==================== 移动端详情页布局 ====================

const MobileDetailLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentItem = settingsMenuItems.find(item => location.pathname === item.path);

  // 进入详情页时自动滚到顶部
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {/* 固定 Header */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--border)]">
        <div className="flex items-center gap-3 p-4">
          <Link
            to="/settings"
            className="p-2 hover:bg-[var(--card)] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-[var(--text)] truncate">
              {currentItem ? t(currentItem.labelKey) : t('settings.title')}
            </h1>
          </div>
        </div>
      </div>
      
      {/* 内容区域 - 只渲染 Outlet */}
      <div className="p-4">
        <Outlet />
      </div>
      
      {/* Build Hash 显示 */}
      <div className="mt-8 pt-4 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--text-muted)] font-mono">
          Build: {BUILD_HASH}
        </p>
      </div>
    </div>
  );
};

// ==================== 桌面端设置布局 ====================

const DesktopSettingsLayout: React.FC = () => {
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
            {!isSettingsRoot && (
              <Link
                to="/settings"
                className="p-2 hover:bg-[var(--card)] rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
              </Link>
            )}
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
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
                  <span className="text-3xl font-bold text-white">⚙️</span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
                  {t('settings.title')}
                </h2>
                <p className="text-[var(--text-muted)] mb-6">
                  {t('settings.subtitle')}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {t('settings.selectItem')}
                </p>
              </Card>
            ) : (
              <Outlet />
            )}
            
            {/* Build Hash 显示 */}
            <div className="mt-8 pt-4 border-t border-[var(--border)] text-center">
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Build: {BUILD_HASH}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ==================== 主 SettingsLayout 组件 ====================

export const SettingsLayoutFixed: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isSettingsRoot = location.pathname === '/settings';
  
  if (isMobile) {
    // 移动端：完全分离的页面
    if (isSettingsRoot) {
      // 移动端列表页：只渲染列表
      return <MobileSettingsList />;
    } else {
      // 移动端详情页：只渲染 Outlet（详情页内容）
      return <MobileDetailLayout />;
    }
  } else {
    // 桌面端：左右分栏布局
    return <DesktopSettingsLayout />;
  }
};

export default SettingsLayoutFixed;
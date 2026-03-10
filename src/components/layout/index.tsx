import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Wallet,
  Send,
  ArrowLeftRight,
  Users,
  Gift,
  History,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Copy,
  Check,
  ArrowLeft,
  TrendingUp,
  Compass,
  Globe,
  BarChart2,
  User,
  BookOpen
} from 'lucide-react';
import { useWalletStore } from '../../store';
import { Modal, useToast, ToastManager } from '../ui';

// ==================== 导航项配置 ====================

const navItems = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'wallets', labelKey: 'nav.wallets', icon: Wallet, path: '/wallets' },
  { id: 'market', labelKey: 'nav.market', icon: TrendingUp, path: '/market' },
  { id: 'contracts', labelKey: 'nav.contracts', icon: BarChart2, path: '/contracts' },
  { id: 'discover', labelKey: 'nav.discover', icon: Compass, path: '/discover' },
  { id: 'activity', labelKey: 'nav.activity', icon: History, path: '/activity' },
];

// ==================== 响应式工具 Hook ====================

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

// ==================== Wallet Control Bar ====================

const WalletControlBar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, setUser } = useWalletStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showToast } = useToast();
  const isMobile = useIsMobile();

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      showToast(t('common.copied'), 'success');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('canton_access_token');
    }
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      <header className="h-14 glass border-b border-[var(--glass-border)] flex items-center justify-between px-3 sm:px-4 sticky top-0 z-50">
        {/* Left: Menu Toggle + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 hover:bg-white/5 rounded-lg transition-colors touch-manipulation"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img
              src="/canton-logo.jpg"
              alt="Canton Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover shadow-lg shadow-green-500/25 group-hover:shadow-green-500/35 transition-shadow"
            />
            <span className="font-display font-semibold text-[var(--text)] text-sm hidden sm:block tracking-tight">Canton</span>
          </Link>
        </div>

        {/* Right: Network + Wallet */}
        <div className="flex items-center gap-2">
          {/* Network Badge - Hidden on smallest screens */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 glass rounded-lg border border-[var(--glass-border)]">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">Canton</span>
          </div>

          {/* Wallet Address Button */}
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 glass hover:bg-white/10 rounded-lg border border-[var(--glass-border)] transition-all duration-200 touch-manipulation min-h-[36px]"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-500/25">
                <span className="text-[var(--text)] text-[10px] font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
              
              <span className="text-sm text-[var(--text)] truncate max-w-[120px] sm:max-w-[180px] hidden sm:block">
                {user?.email ?? ''}
              </span>
              
              <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] flex-shrink-0 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-2 w-[280px] sm:w-72 rounded-xl overflow-hidden z-50 bg-[rgba(10,14,23,0.95)] backdrop-blur-[12px] border border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                  >
                    {/* Account Section */}
                    <div className="p-4 border-b border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)] mb-2">{t('common.connectedWallet')}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-[var(--text)] truncate flex-1 min-w-0">{user?.email}</p>
                        <button
                          onClick={handleCopyEmail}
                          className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors touch-manipulation"
                          title="Copy email"
                        >
                          <Copy className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text)]" />
                        </button>
                      </div>
                    </div>

                    {/* Menu Items - 账户管理 / 地址簿 / 邀请 / 奖励 */}
                    <div className="p-2">
                      <Link
                        to="/settings/account"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/[0.05] rounded-lg transition-colors touch-manipulation"
                      >
                        <User className="w-4 h-4" />
                        {t('settings.accountManagement')}
                      </Link>
                      <Link
                        to="/settings/address-book"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/[0.05] rounded-lg transition-colors touch-manipulation"
                      >
                        <BookOpen className="w-4 h-4" />
                        {t('settings.addressBook')}
                      </Link>
                      <Link
                        to="/settings/invite"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/[0.05] rounded-lg transition-colors touch-manipulation"
                      >
                        <Users className="w-4 h-4" />
                        {t('settings.inviteFriend')}
                      </Link>
                      <Link
                        to="/settings/rewards"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/[0.05] rounded-lg transition-colors touch-manipulation"
                      >
                        <Gift className="w-4 h-4" />
                        {t('settings.rewards')}
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[var(--border)]" />

                    {/* 设置 / 语言 / 浏览器查看 */}
                    <div className="p-2">
                      <Link
                        to="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-white/[0.05] rounded-lg transition-colors touch-manipulation"
                      >
                        <Settings className="w-4 h-4" />
                        {t('common.settings')}
                      </Link>

                      {/* Language Option - inline switcher */}
                      <div className="flex items-center gap-3 px-3 py-3">
                        <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-sm text-[var(--text-secondary)] flex-1">{t('common.language')}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              i18n.changeLanguage('zh');
                              localStorage.setItem('canton_language', 'zh');
                            }}
                            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                              i18n.language === 'zh'
                                ? 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                                : 'text-[var(--text-muted)] hover:bg-white/[0.05] hover:text-[var(--text)]'
                            }`}
                          >
                            中文
                          </button>
                          <button
                            onClick={() => {
                              i18n.changeLanguage('en');
                              localStorage.setItem('canton_language', 'en');
                            }}
                            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                              i18n.language === 'en'
                                ? 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                                : 'text-[var(--text-muted)] hover:bg-white/[0.05] hover:text-[var(--text)]'
                            }`}
                          >
                            EN
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Sign Out */}
                    <div className="p-2 border-t border-[var(--border)]">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors touch-manipulation"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('common.signOut')}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Logout Confirmation */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title={t('common.logout')}
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] bg-[var(--card)] hover:bg-[var(--card-hover)] rounded-xl transition-colors touch-manipulation"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-3 text-sm text-[var(--text)] bg-red-500 hover:bg-red-600 rounded-xl transition-colors touch-manipulation"
            >
              {t('common.confirmLogout')}
            </button>
          </div>
        }
      >
        <p className="text-[var(--text-muted)] text-sm">{t('common.logoutDesc')}</p>
      </Modal>
    </>
  );
};

// ==================== Mobile Drawer Sidebar ====================

const MobileDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useWalletStore();
  const location = useLocation();
  const { t } = useTranslation();
  const currentPath = location.pathname;

  // 触摸手势状态
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  
  const minSwipeDistance = 80;

  // 处理手势返回
  useEffect(() => {
    if (!isOpen) return;
    
    const handlePopState = () => {
      onClose();
    };
    
    window.history.pushState({ drawer: true }, '');
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);
  
  // 触摸开始
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  // 触摸移动
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStart;
    
    // 只能向左滑动（关闭方向）
    if (diff < 0) {
      setTranslateX(diff);
    }
  };
  
  // 触摸结束
  const onTouchEnd = () => {
    if (Math.abs(translateX) > minSwipeDistance) {
      onClose();
    }
    setTouchStart(null);
    setTranslateX(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="lg:hidden fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.aside
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] glass-strong border-r border-[var(--glass-border)] z-50 flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: translateX }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Drawer Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--glass-border)]">
              <Link to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
                <img
                  src="/canton-logo.jpg"
                  alt="Canton Logo"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="font-semibold text-[var(--text)]">Canton</span>
              </Link>
              
              <button
                className="p-2 -mr-1 text-[var(--text-muted)] hover:text-[var(--text)] touch-manipulation"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all touch-manipulation ${
                      isActive
                        ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card)]'
                    }`}
                    onClick={onClose}
                  >
                    <span className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-base font-medium">{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-[var(--text)] text-sm font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--text)] truncate">{user?.email}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ==================== Desktop Sidebar ====================

const DesktopSidebar: React.FC = () => {
  const { user } = useWalletStore();
  const location = useLocation();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentPath = location.pathname;

  return (
    <motion.aside
      className="hidden lg:flex flex-col h-[calc(100vh-56px)] sticky top-14 border-r border-[var(--glass-border)] glass"
      initial={false}
      animate={{ width: isCollapsed ? 64 : 200 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-4 w-8 h-8 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] z-10 touch-manipulation"
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-90'}`} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card)]'
              }`}
              title={isCollapsed ? t(item.labelKey) : undefined}
            >
              <span className={isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}>
                <Icon className="w-4 h-4 flex-shrink-0" />
              </span>
              
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.span 
                    className="text-sm font-medium whitespace-nowrap"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {t(item.labelKey)}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User Mini Profile */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 border-t border-[var(--border)]"
          >
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[var(--text)] text-xs font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-[var(--text)] truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-[var(--text-muted)]">{t('common.institutional')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

// ==================== Main Layout ====================

// ==================== App Footer ====================

const AppFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)] py-4 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <span className="text-sm text-[var(--text-muted)]">
          © Canton Wallet
        </span>
        <Link
          to="/terms"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
        >
          {t('common.termsPrivacy')}
        </Link>
      </div>
    </footer>
  );
};

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col relative grain-overlay bg-grid-pattern">
      <WalletControlBar onMenuClick={() => setIsDrawerOpen(true)} />
      
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      <div className="flex flex-1">
        <DesktopSidebar />
        
        <main className="flex-1 min-h-[calc(100vh-56px)] overflow-auto flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </div>
          <AppFooter />
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastManager toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default MainLayout;

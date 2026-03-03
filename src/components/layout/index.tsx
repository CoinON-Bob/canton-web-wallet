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
  ExternalLink,
  Check,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';
import { useWalletStore } from '../../store';
import { Modal, useToast, ToastManager } from '../ui';

// ==================== 导航项配置 ====================

const navItems = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'market', labelKey: 'nav.market', icon: TrendingUp, path: '/market' },
  { id: 'assets', labelKey: 'nav.assets', icon: Wallet, path: '/assets' },
  { id: 'send', labelKey: 'nav.send', icon: Send, path: '/send' },
  { id: 'swap', labelKey: 'nav.swap', icon: ArrowLeftRight, path: '/swap' },
  { id: 'batch', labelKey: 'nav.batch', icon: Users, path: '/batch' },
  { id: 'offers', labelKey: 'nav.offers', icon: Gift, path: '/offers' },
  { id: 'activity', labelKey: 'nav.activity', icon: History, path: '/activity' },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings, path: '/settings' },
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
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { showToast } = useToast();
  const isMobile = useIsMobile();

  const handleCopyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      showToast(t('common.copied'), 'success');
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <>
      <header className="h-14 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-50">
        {/* Left: Menu Toggle + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 hover:bg-white/5 rounded-lg transition-colors touch-manipulation"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <span className="font-semibold text-white text-sm hidden sm:block">Canton</span>
          </Link>
        </div>

        {/* Right: Network + Wallet */}
        <div className="flex items-center gap-2">
          {/* Network Badge - Hidden on smallest screens */}
          
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-300">Canton</span>
          </div>

          {/* Wallet Address Button */}
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors touch-manipulation min-h-[36px]"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
              
              <span className="text-sm text-white font-mono hidden sm:block">
                {user?.walletAddress ? formatAddress(user.walletAddress) : ''}
              </span>
              
              <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
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
                    className="absolute right-0 top-full mt-2 w-[280px] sm:w-72 bg-[#111118] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {/* Address Section */}
                    <div className="p-4 border-b border-white/5">
                      <p className="text-xs text-gray-500 mb-2">Connected Wallet</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white font-mono truncate flex-1">{user?.walletAddress}</p>
                        <button
                          onClick={handleCopyAddress}
                          className="p-2 hover:bg-white/5 rounded-lg transition-colors touch-manipulation"
                          title="Copy address"
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2 truncate">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        to="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors touch-manipulation"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsMenuOpen(false);
                          window.open(`https://explorer.canton.network/address/${user?.walletAddress}`, '_blank');
                        }}
                        className="flex items-center gap-3 px-3 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors touch-manipulation"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on Explorer
                      </a>
                    </div>

                    {/* Sign Out */}
                    <div className="p-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors touch-manipulation"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
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
              className="flex-1 px-4 py-3 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors touch-manipulation"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-3 text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors touch-manipulation"
            >
              {t('common.confirmLogout')}
            </button>
          </div>
        }
      >
        <p className="text-gray-400 text-sm">{t('common.logoutDesc')}</p>
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
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.aside
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-[#0a0a0f] border-r border-white/10 z-50 flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: translateX }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Drawer Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
              <Link to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">C</span>
                </div>
                <span className="font-semibold text-white">Canton</span>
              </Link>
              
              <button
                className="p-2 -mr-1 text-gray-400 hover:text-white touch-manipulation"
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
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={onClose}
                  >
                    <span className={isActive ? 'text-blue-400' : 'text-gray-500'}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-base font-medium">{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{user?.email}</p>
                  <p className="text-xs text-gray-500 font-mono">
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
      className="hidden lg:flex flex-col h-[calc(100vh-56px)] sticky top-14 border-r border-white/5 bg-[#0a0a0f]"
      initial={false}
      animate={{ width: isCollapsed ? 64 : 200 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 w-6 h-6 bg-[#111118] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white z-10"
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
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={isCollapsed ? t(item.labelKey) : undefined}
            >
              <span className={isActive ? 'text-blue-400' : 'text-gray-500'}>
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
            className="p-3 border-t border-white/5"
          >
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-gray-500">Institutional</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

// ==================== Main Layout ====================

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <WalletControlBar onMenuClick={() => setIsDrawerOpen(true)} />
      
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      <div className="flex">
        <DesktopSidebar />
        
        <main className="flex-1 min-h-[calc(100vh-56px)] overflow-auto">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastManager toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default MainLayout;

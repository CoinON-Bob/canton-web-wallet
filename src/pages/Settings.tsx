import React, { useState, useEffect } from 'react';
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
  Languages
} from 'lucide-react';
import { useWalletStore } from '../store';
import { shortAddress } from '../utils/address';
import { Card, PageTransition, PageHeader, Modal } from '../components/ui';

// ==================== Settings 页面 ====================

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, setUser, toggleHideBalance, hideBalance, theme, toggleTheme } = useWalletStore();
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Preferences with language from i18n
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    hideBalances: hideBalance,
    darkMode: theme === 'dark',
    language: i18n.language === 'zh' ? '中文(简体)' : 'English'
  });

  // Sync theme from store
  useEffect(() => {
    setPreferences(prev => ({ ...prev, darkMode: theme === 'dark' }));
  }, [theme]);

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'hideBalances') {
      toggleHideBalance();
    }
    if (key === 'darkMode') {
      toggleTheme();
    }
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const changeLanguage = (lang: string) => {
    const code = lang === '中文(简体)' ? 'zh' : 'en';
    i18n.changeLanguage(code);
    setPreferences(prev => ({ ...prev, language: lang }));
  };

  const formatAddress = (addr: string) => shortAddress(addr, 6, 4);

  return (
    <PageTransition className="min-h-screen">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          
          <div className="lg:w-64 flex-shrink-0">
            <Card className="p-2">
              <nav className="space-y-1">
                {[
                  { id: 'profile', labelKey: 'settings.profile', icon: User },
                  { id: 'preferences', labelKey: 'settings.preferences', icon: Globe },
                  { id: 'security', labelKey: 'settings.security', icon: Shield },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as typeof activeSection)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      activeSection === item.id 
                        ? 'bg-[var(--primary-subtle)] text-[var(--primary)]' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--card-hover)]'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{t(item.labelKey)}</span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                      activeSection === item.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                ))}
              </nav>
              
              <div className="border-t border-[var(--border-subtle)] mt-2 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--error)] hover:bg-[var(--error-subtle)] transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t('common.logout')}</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Content */}
          
          <div className="flex-1 space-y-4">
            {/* Profile Section */}
            
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Card className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
003e
                      <span className="text-[var(--text)] text-3xl font-bold">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text)]">{user?.email?.split('@')[0]}</h3>
                      <p className="text-[var(--text-muted)]">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[var(--text-secondary)] mb-2">{t('settings.walletAddress')}</label>
                      <div className="flex items-center gap-2 p-3 bg-[var(--card-hover)] rounded-xl">
                        <Wallet className="w-5 h-5 text-[var(--text-muted)]" />
                        <span className="text-[var(--text)] font-mono flex-1">{formatAddress(user?.walletAddress || '')}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(user?.walletAddress || '')}
                          className="p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4 text-[var(--text-secondary)]" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[var(--card-hover)] rounded-xl">
                        <p className="text-sm text-[var(--text-secondary)]">{t('settings.accountType')}</p>
                        <p className="text-[var(--text)] font-medium">{t('settings.standard')}</p>
                      </div>
                      
                      <div className="p-4 bg-[var(--card-hover)] rounded-xl">
                        <p className="text-sm text-[var(--text-secondary)]">{t('common.network')}</p>
                        <p className="text-[var(--text)] font-medium">Canton</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Preferences Section */}
            
            {activeSection === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Card className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
                    {t('settings.notifications')}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)]">
                      <div>
                        <p className="text-[var(--text)]">{t('settings.emailNotifications')}</p>
                        <p className="text-sm text-[var(--text-muted)]">{t('settings.emailNotificationsDesc')}</p>
                      </div>
                      
                      <button
                        onClick={() => togglePreference('emailNotifications')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          preferences.emailNotifications ? 'bg-blue-500' : 'bg-[var(--card-active)]'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-[var(--text)]">{t('settings.pushNotifications')}</p>
                        <p className="text-sm text-[var(--text-muted)]">{t('settings.pushNotificationsDesc')}</p>
                      </div>
                      
                      <button
                        onClick={() => togglePreference('pushNotifications')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          preferences.pushNotifications ? 'bg-blue-500' : 'bg-[var(--card-active)]'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.pushNotifications ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[var(--text-secondary)]" />
                    {t('settings.display')}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Language Selector */}
                    <div className="py-3 border-b border-[var(--border-subtle)]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Languages className="w-4 h-4 text-[var(--text-secondary)]" />
                          <p className="text-[var(--text)]">{t('common.language')}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {['English', '中文(简体)'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => changeLanguage(lang)}
                            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                              preferences.language === lang 
                                ? 'bg-blue-500 text-[var(--text)]' 
                                : 'bg-[var(--card-hover)] text-[var(--text-secondary)] hover:bg-[var(--card-active)]'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)]">
                      <div>
                        <p className="text-[var(--text)]">{t('settings.hideBalances')}</p>
                        <p className="text-sm text-[var(--text-muted)]">{t('settings.hideBalancesDesc')}</p>
                      </div>
                      
                      <button
                        onClick={() => togglePreference('hideBalances')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          preferences.hideBalances ? 'bg-blue-500' : 'bg-[var(--card-active)]'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.hideBalances ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-[var(--text)]">{t('settings.darkMode')}</p>
                        <p className="text-sm text-[var(--text-muted)]">{t('settings.darkModeDesc')}</p>
                      </div>
                      
                      <button
                        onClick={() => togglePreference('darkMode')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Security Section */}
            
            {activeSection === 'security' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-[var(--text-secondary)]" />
                    {t('settings.security')}
                  </h3>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-[var(--card-hover)] hover:bg-[var(--card-active)] rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-[var(--text-secondary)]" />
                        <div className="text-left">
                          <p className="text-[var(--text)]">{t('settings.exportPrivateKey')}</p>
                          <p className="text-sm text-[var(--text-muted)]">{t('settings.exportPrivateKeyDesc')}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-4 bg-[var(--card-hover)] hover:bg-[var(--card-active)] rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[var(--text-secondary)]" />
                        <div className="text-left">
                          <p className="text-[var(--text)]">{t('settings.twoFactorAuth')}</p>
                          <p className="text-sm text-[var(--text-muted)]">{t('settings.twoFactorAuthDesc')}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                    </button>
                  </div>
                </Card>
                
                <Card className="p-6 border-red-500/20">
                  <h3 className="text-lg font-semibold text-[var(--error)] flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5" />
                    {t('settings.dangerZone')}
                  </h3>
                  
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-[var(--error-subtle)] hover:bg-red-500/20 text-[var(--error)] border border-red-500/20 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    {t('common.logout')}
                  </button>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirm Modal */}
      
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title={t('common.logout')}
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] bg-[var(--card-hover)] hover:bg-[var(--card-active)] rounded-xl transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2.5 text-sm text-[var(--text)] bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
            >
              {t('common.logout')}
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3 text-yellow-500">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">{t('common.confirmLogout')}</p>
            <p className="text-sm text-[var(--text-secondary)]">{t('common.logoutDesc')}</p>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
};

export default SettingsPage;
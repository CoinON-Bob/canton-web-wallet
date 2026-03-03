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
  Languages
} from 'lucide-react';
import { useWalletStore } from '../store';
import { Card, PageTransition, PageHeader, Modal } from '../components/ui';

// ==================== Settings 页面 ====================

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, setUser, toggleHideBalance, hideBalance } = useWalletStore();
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Preferences with language from i18n
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    hideBalances: hideBalance,
    darkMode: true,
    language: i18n.language === 'zh' ? '中文(简体)' : 'English'
  });

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'hideBalances') {
      toggleHideBalance();
    }
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const changeLanguage = (lang: string) => {
    const code = lang === '中文(简体)' ? 'zh' : 'en';
    i18n.changeLanguage(code);
    setPreferences(prev => ({ ...prev, language: lang }));
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <PageTransition className="min-h-screen">
      <PageHeader title="Settings" subtitle="Manage your account preferences" />
      
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          
          <div className="lg:w-64 flex-shrink-0">
            <Card className="p-2">
              <nav className="space-y-1">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'preferences', label: 'Preferences', icon: Globe },
                  { id: 'security', label: 'Security', icon: Shield },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as typeof activeSection)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      activeSection === item.id 
                        ? 'bg-blue-500/10 text-blue-400' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                      activeSection === item.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                ))}
              </nav>
              
              <div className="border-t border-white/5 mt-2 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
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
                      <span className="text-white text-3xl font-bold">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user?.email?.split('@')[0]}</h3>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
                      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                        <Wallet className="w-5 h-5 text-gray-500" />
                        <span className="text-white font-mono flex-1">{formatAddress(user?.walletAddress || '')}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(user?.walletAddress || '')}
                          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl">
                        <p className="text-sm text-gray-400">Account Type</p>
                        <p className="text-white font-medium">Standard</p>
                      </div>
                      
                      <div className="p-4 bg-white/5 rounded-xl">
                        <p className="text-sm text-gray-400">Network</p>
                        <p className="text-white font-medium">Canton</p>
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
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-400" />
                    Notifications
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                      <div>
                        <p className="text-white">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates about your transactions</p>
                      </div>
                      
                      <button
                        onClick={() => togglePreference('emailNotifications')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          preferences.emailNotifications ? 'bg-blue-500' : 'bg-white/10'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-white">Push Notifications</p>
                        <p className="text-sm text-gray-500">Get notified when transactions complete</p>
                      </div>
                      
                      <button
                        onClick={() => togglePreference('pushNotifications')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          preferences.pushNotifications ? 'bg-blue-500' : 'bg-white/10'
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
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gray-400" />
                    {t('settings.display')}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Language Selector */}
                    <div className="py-3 border-b border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Languages className="w-4 h-4 text-gray-400" />
                          <p className="text-white">{t('common.language')}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {['English', '中文(简体)'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => changeLanguage(lang)}
                            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                              preferences.language === lang 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                      <div>
                        <p className="text-white">{t('settings.hideBalances')}</p>
                        <p className="text-sm text-gray-500">{t('settings.hideBalancesDesc')}</p>
                      </div>
                      
                      <button
                        onClick={() => togglePreference('hideBalances')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          preferences.hideBalances ? 'bg-blue-500' : 'bg-white/10'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.hideBalances ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-white">{t('settings.darkMode')}</p>
                        <p className="text-sm text-gray-500">{t('settings.darkModeDesc')}</p>
                      </div>
                      
                      <button
                        onClick={() => togglePreference('darkMode')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          preferences.darkMode ? 'bg-blue-500' : 'bg-white/10'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.darkMode ? 'translate-x-7' : 'translate-x-1'
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
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-gray-400" />
                    Security
                  </h3>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-gray-400" />
                        <div className="text-left">
                          <p className="text-white">Export Private Key</p>
                          <p className="text-sm text-gray-500">Download encrypted backup</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <div className="text-left">
                          <p className="text-white">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Add extra security layer</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </Card>
                
                <Card className="p-6 border-red-500/20">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
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
        title="Sign Out"
        size="sm"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-4 py-2.5 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3 text-yellow-500">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Confirm Sign Out</p>
            <p className="text-sm text-gray-400">Are you sure you want to sign out? You will need to sign in again to access your wallet.</p>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
};

export default SettingsPage;
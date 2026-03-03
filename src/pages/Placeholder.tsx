import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Construction, LogOut, AlertTriangle } from 'lucide-react';
import { useWalletStore } from '../store';
import { Card, PageTransition, Modal } from '../components/ui';

// ==================== 占位页面组件 ====================

interface PlaceholderPageProps {
  title: string;
  description?: string;
  showSignOut?: boolean;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  description = 'This feature is under development and will be available soon.',
  showSignOut = false
}) => {
  const { setUser } = useWalletStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <PageTransition className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 sm:p-12 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-600">
              <Construction className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{title}</h2>
            
            <p className="text-gray-400 text-sm sm:text-base max-w-sm mx-auto mb-8">{description}</p>

            {showSignOut && (
              <>
                <div className="border-t border-white/10 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
                  
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full sm:w-auto inline-flex items-center gap-2 px-6 py-3 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>

                <Modal
                  isOpen={showLogoutConfirm}
                  onClose={() => setShowLogoutConfirm(false)}
                  title="Sign Out"
                  size="sm"
                  footer={
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="flex-1 px-4 py-2 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex-1 px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  }
                >
                  <div className="flex items-center gap-3 text-yellow-500 mb-3">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Confirm Sign Out</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Are you sure you want to sign out? You will need to sign in again to access your wallet.
                  </p>
                </Modal>
              </>
            )}
          </motion.div>
        </Card>
      </div>
    </PageTransition>
  );
};

// ==================== 各页面导出 ====================

export const SendPage: React.FC = () => (
  <PlaceholderPage 
    title="Send Assets"
    description="Securely send assets to any address with gas estimation, address book integration, and transaction preview."
  />
);

export const SwapPage: React.FC = () => (
  <PlaceholderPage 
    title="Token Swap"
    description="Swap tokens instantly with optimal routing, slippage protection, and real-time price charts."
  />
);

export const BatchPage: React.FC = () => (
  <PlaceholderPage 
    title="Batch Transfers"
    description="Execute mass transfers efficiently with CSV import, progress tracking, and partial failure handling."
  />
);

export const OffersPage: React.FC = () => (
  <PlaceholderPage 
    title="Canton Offers"
    description="Create and manage peer-to-peer offers with customizable conditions and expiration settings."
  />
);

export const ActivityPage: React.FC = () => (
  <PlaceholderPage 
    title="Activity Log"
    description="Complete transaction history with advanced filtering, search, and export capabilities."
  />
);

export const SettingsPage: React.FC = () => (
  <PlaceholderPage 
    title="Settings"
    description="Manage your account preferences, security settings, and notification preferences."
    showSignOut={true}
  />
);

export default PlaceholderPage;

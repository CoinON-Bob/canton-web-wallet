import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Mail, 
  Wallet, 
  Shield, 
  Edit2,
  Key,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card } from '../../components/ui';
import { useWalletStore } from '../../store';
import { MOCK_CANTON_ADDRESS } from '../../config/canton';
import { shortAddress } from '../../utils/address';

// ==================== 账户管理页面 ====================

export const SettingsAccountPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useWalletStore();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveEmail = () => {
    // Mock save - in real app this would call API
    console.log('Saving email:', newEmail);
    setIsEditingEmail(false);
  };

  const handleChangePassword = () => {
    // Mock password change
    console.log('Changing password');
    setIsChangingPassword(false);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">
              {t('settings.accountManagement')}
            </h1>
            <p className="text-[var(--text-muted)]">
              {t('settings.accountManagementDesc')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 账户信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="space-y-6">
            {/* 邮箱信息 */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text)] mb-1">
                    {t('settingsAccount.email')}
                  </h3>
                  {isEditingEmail ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                        placeholder={t('settingsAccount.email')}
                      />
                      <button
                        onClick={handleSaveEmail}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {t('common.save')}
                      </button>
                      <button
                        onClick={() => setIsEditingEmail(false)}
                        className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-[var(--text)]">{user?.email || 'user@example.com'}</p>
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        {t('settingsAccount.verified')}
                      </span>
                      <button
                        onClick={() => setIsEditingEmail(true)}
                        className="p-1.5 hover:bg-[var(--card)] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 钱包地址 */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text)] mb-1">
                    {t('settingsAccount.walletAddress')}
                  </h3>
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-mono text-[var(--text)] bg-[var(--card)] px-3 py-1.5 rounded-lg truncate flex-1 min-w-0">
                      <span className="hidden sm:inline">{MOCK_CANTON_ADDRESS}</span>
                      <span className="sm:hidden">{shortAddress(MOCK_CANTON_ADDRESS, 6, 4)}</span>
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(MOCK_CANTON_ADDRESS)}
                      className="flex-shrink-0 px-3 py-1.5 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/20 transition-colors text-sm"
                    >
                      {t('common.copy')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 账户类型 */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text)] mb-1">
                    {t('settingsAccount.accountType')}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                      {t('settingsAccount.accountTypeName')}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {t('settingsAccount.accountTypeDesc')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 安全状态 */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text)] mb-1">
                    {t('settingsAccount.securityStatus')}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-[var(--text)]">{t('settingsAccount.emailVerified')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-[var(--text)]">{t('settingsAccount.twoFA')}</span>
                      <button className="text-sm text-blue-400 hover:text-blue-300">
                        {t('settingsAccount.twoFAEnable')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 操作按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* 更改密码 */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-[var(--text)] mb-2">
                {t('settingsAccount.changePass')}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                {t('settingsAccount.changePassDesc')}
              </p>
              {isChangingPassword ? (
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder={t('settingsAccount.currentPass')}
                    className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                  />
                  <input
                    type="password"
                    placeholder={t('settingsAccount.newPass')}
                    className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                  />
                  <input
                    type="password"
                    placeholder={t('settingsAccount.confirmPass')}
                    className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {t('settingsAccount.updatePass')}
                    </button>
                    <button
                      onClick={() => setIsChangingPassword(false)}
                      className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/20 transition-colors"
                >
                  {t('settingsAccount.changePass')}
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* 账户操作 */}
        <Card className="p-6">
          <div>
            <h3 className="font-medium text-[var(--text)] mb-2">
              {t('settingsAccount.actions')}
            </h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {t('settingsAccount.actionsDesc')}
            </p>
            <div className="space-y-3">
              <button
                className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors text-left"
                onClick={() => console.log('Export data')}
              >
                {t('settingsAccount.exportData')}
              </button>
              <button
                className="w-full px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors text-left"
                onClick={() => console.log('Delete account')}
              >
                {t('settingsAccount.deleteAccount')}
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 安全提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-purple-600/5 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-[var(--text)] mb-2">
                {t('settingsAccount.secRec')}
              </h4>
              <ul className="space-y-1.5 text-sm text-[var(--text-muted)]">
                <li>• {t('settingsAccount.secRec1')}</li>
                <li>• {t('settingsAccount.secRec2')}</li>
                <li>• {t('settingsAccount.secRec3')}</li>
                <li>• {t('settingsAccount.secRec4')}</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsAccountPage;
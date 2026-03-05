import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bell, Mail, Smartphone, Check, Shield } from 'lucide-react';
import { Card } from '../../components/ui';

export const SettingsNotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    transactionAlerts: true,
    priceAlerts: false,
    securityAlerts: true,
    marketingEmails: false,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // 保存到 localStorage
    localStorage.setItem(`canton_notifications_${key}`, (!notifications[key]).toString());
  };

  const notificationItems = [
    {
      id: 'emailNotifications',
      icon: Mail,
      title: t('settingsNotif.email'),
      description: t('settingsNotif.emailDesc'),
      enabled: notifications.emailNotifications,
    },
    {
      id: 'pushNotifications',
      icon: Smartphone,
      title: t('settingsNotif.push'),
      description: t('settingsNotif.pushDesc'),
      enabled: notifications.pushNotifications,
    },
    {
      id: 'transactionAlerts',
      icon: Bell,
      title: t('settingsNotif.transaction'),
      description: t('settingsNotif.transactionDesc'),
      enabled: notifications.transactionAlerts,
    },
    {
      id: 'priceAlerts',
      icon: Bell,
      title: t('settingsNotif.price'),
      description: t('settingsNotif.priceDesc'),
      enabled: notifications.priceAlerts,
    },
    {
      id: 'securityAlerts',
      icon: Shield,
      title: t('settingsNotif.security'),
      description: t('settingsNotif.securityDesc'),
      enabled: notifications.securityAlerts,
    },
    {
      id: 'marketingEmails',
      icon: Mail,
      title: t('settingsNotif.marketing'),
      description: t('settingsNotif.marketingDesc'),
      enabled: notifications.marketingEmails,
    },
  ];

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
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">
              {t('settings.notifications')}
            </h1>
            <p className="text-[var(--text-muted)]">
              {t('settings.notificationsDesc')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 通知设置卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="space-y-4">
            {notificationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * index }}
                  className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text)]">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(item.id as keyof typeof notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      item.enabled ? 'bg-blue-500' : 'bg-[var(--border)]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        item.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* 设置提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-600/5 border border-green-500/20">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-[var(--text)] mb-2">
                {t('settingsNotif.tipsTitle')}
              </h4>
              <ul className="space-y-1.5 text-sm text-[var(--text-muted)]">
                <li>• {t('settingsNotif.tip1')}</li>
                <li>• {t('settingsNotif.tip2')}</li>
                <li>• {t('settingsNotif.tip3')}</li>
                <li>• {t('settingsNotif.tip4')}</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Build Hash 显示 */}
      <div className="mt-8 pt-4 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--text-muted)] font-mono">
          Build: 33b4c68
        </p>
      </div>
    </div>
  );
};

export default SettingsNotificationsPage;
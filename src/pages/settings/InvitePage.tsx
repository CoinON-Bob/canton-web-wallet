import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users, Copy, Share2, Gift, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui';

export const SettingsInvitePage: React.FC = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  
  // 生成固定的邀请码
  const inviteCode = 'CANTON-2024-FRIEND';
  const inviteLink = `https://canton-wallet.com/invite/${inviteCode}`;
  const referralStats = {
    totalInvites: 12,
    successfulInvites: 8,
    pendingRewards: 240,
    totalRewards: 1200,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    // 可以添加 toast 提示
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Canton Wallet',
          text: `Use my invite code ${inviteCode} to join Canton Wallet!`,
          url: inviteLink,
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      handleCopyLink();
    }
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
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">
              {t('settings.inviteFriend')}
            </h1>
            <p className="text-[var(--text-muted)]">
              {t('settings.inviteFriendDesc')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 邀请码卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text)] mb-2">
              Invite Friends, Earn Rewards
            </h2>
            <p className="text-[var(--text-muted)]">
              Share your unique invite code and earn rewards when friends join
            </p>
          </div>

          {/* 邀请码展示 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Your Invite Code
            </label>
            <div className="flex gap-2">
              <div className="flex-1 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl font-mono text-lg font-bold text-center text-[var(--text)]">
                {inviteCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <Copy className="w-5 h-5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* 邀请链接 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Invite Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-muted)] truncate">
                {inviteLink}
              </div>
              <button
                onClick={handleShare}
                className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>

          {/* 分享按钮组 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)]/30 transition-colors flex flex-col items-center gap-2"
            >
              <Share2 className="w-6 h-6 text-[var(--text)]" />
              <span className="text-sm font-medium text-[var(--text)]">Share</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)]/30 transition-colors flex flex-col items-center gap-2"
            >
              <Copy className="w-6 h-6 text-[var(--text)]" />
              <span className="text-sm font-medium text-[var(--text)]">Copy Link</span>
            </button>
          </div>
        </Card>
      </motion.div>

      {/* 统计数据 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
            Your Referral Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-xl">
              <div className="text-2xl font-bold text-[var(--text)] mb-1">
                {referralStats.totalInvites}
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                Total Invites
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/5 to-emerald-600/5 rounded-xl">
              <div className="text-2xl font-bold text-[var(--text)] mb-1">
                {referralStats.successfulInvites}
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                Successful
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-500/5 to-orange-600/5 rounded-xl">
              <div className="text-2xl font-bold text-[var(--text)] mb-1">
                ${referralStats.pendingRewards}
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                Pending Rewards
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-600/5 rounded-xl">
              <div className="text-2xl font-bold text-[var(--text)] mb-1">
                ${referralStats.totalRewards}
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                Total Earned
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 奖励说明 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-600/5 border border-green-500/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-[var(--text)] mb-2">
                How It Works
              </h4>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Share your invite code with friends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Friends sign up using your code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Earn $20 for each successful referral</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Rewards are paid in USDT weekly</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsInvitePage;
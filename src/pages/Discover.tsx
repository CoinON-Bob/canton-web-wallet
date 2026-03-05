import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  Zap,
  CreditCard,
  Shield,
  Globe,
  BarChart3,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { useToast } from '../components/ui';

// ==================== DApp 卡片数据 ====================

const dappCards = [
  {
    id: 'temple',
    name: 'Temple',
    description: 'DeFi yield optimization and staking platform',
    descriptionZh: 'DeFi 收益优化和质押平台',
    icon: Zap,
    status: 'Coming Soon',
    statusZh: '即将开放',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'canton-pay',
    name: 'Canton Pay',
    description: 'Instant payments and settlements on Canton',
    descriptionZh: 'Canton 网络上的即时支付和结算',
    icon: CreditCard,
    status: 'Coming Soon',
    statusZh: '即将开放',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'unhedged',
    name: 'Unhedged',
    description: 'Risk management and hedging solutions',
    descriptionZh: '风险管理和对冲解决方案',
    icon: Shield,
    status: 'Coming Soon',
    statusZh: '即将开放',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'xns',
    name: 'XNS',
    description: 'Cross-chain naming service and identity',
    descriptionZh: '跨链命名服务和身份系统',
    icon: Globe,
    status: 'Coming Soon',
    statusZh: '即将开放',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'ea-finance',
    name: 'EA Finance',
    description: 'Algorithmic trading and market making',
    descriptionZh: '算法交易和做市服务',
    icon: BarChart3,
    status: 'Coming Soon',
    statusZh: '即将开放',
    color: 'from-indigo-500 to-blue-500',
  },
];

// ==================== 卡片组件 ====================

interface CardProps {
  card: typeof dappCards[0];
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language === 'zh';
  const Icon = card.icon;

  const name = card.name;
  const description = isChinese ? (card as any).descriptionZh || card.description : card.description;
  const status = isChinese ? (card as any).statusZh || (card as any).status : (card as any).status;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 cursor-pointer hover:border-[var(--primary)]/30 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${(card as any).color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {status && (
          <span className={`px-2 py-1 text-xs rounded-full ${
            status === 'Available' || status === '可用' 
              ? 'bg-green-500/10 text-green-400' 
              : 'bg-yellow-500/10 text-yellow-400'
          }`}>
            {status}
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{name}</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">{description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-muted)]">
          {t('discover.dapp')}
        </span>
        <ExternalLink className="w-4 h-4 text-[var(--text-muted)]" />
      </div>
    </motion.div>
  );
};

// ==================== 主页面组件 ====================

const Discover: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const isChinese = i18n.language === 'zh';

  const handleDAppClick = (dapp: typeof dappCards[0]) => {
    if (dapp.status === 'Coming Soon' || dapp.statusZh === '即将开放') {
      showToast(
        isChinese 
          ? `${dapp.name} 正在开发中，敬请期待！`
          : `${dapp.name} is under development, stay tuned!`,
        'info'
      );
    }
  };

  return (
    <div className="min-h-screen">
      {/* 页面头部 */}
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)]">{t('discover.title', 'Discover')}</h1>
              <p className="text-[var(--text-muted)]">
                {isChinese ? '探索 Canton 生态系统中的 DApp 和生态项目' : 'Explore DApps and ecosystem projects on Canton'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* DApp 区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-2xl font-bold text-[var(--text)]">{t('discover.dapps', 'DApps')}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dappCards.map((dapp, index) => (
              <motion.div
                key={dapp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              >
                <Card
                  card={dapp}
                  onClick={() => handleDAppClick(dapp)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 底部说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-12 p-6 bg-gradient-to-br from-[var(--card)] to-[var(--card-hover)] border border-[var(--border)] rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-[var(--primary)] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                {isChinese ? '生态系统持续扩展中' : 'Ecosystem is expanding'}
              </h3>
              <p className="text-[var(--text-muted)]">
                {isChinese 
                  ? 'Canton 网络正在快速发展，更多 DApp 和工具即将上线。我们会持续更新此页面，为您带来最新的生态项目。'
                  : 'The Canton network is growing rapidly, with more DApps and tools coming soon. We\'ll keep this page updated with the latest ecosystem projects.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Discover;
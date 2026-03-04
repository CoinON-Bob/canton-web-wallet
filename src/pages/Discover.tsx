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
  Send
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
  {
    id: 'transfer-tool',
    name: 'Transfer Tool',
    description: 'Quick asset transfer between addresses',
    descriptionZh: '地址间快速资产转账工具',
    icon: Send,
    status: 'Available',
    statusZh: '可用',
    color: 'from-teal-500 to-green-500',
    isTransfer: true,
  },
];

// ==================== DApp 卡片组件 ====================

interface DAppCardProps {
  dapp: typeof dappCards[0];
  onClick: () => void;
}

const DAppCard: React.FC<DAppCardProps> = ({ dapp, onClick }) => {
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language === 'zh';
  const Icon = dapp.icon;
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 cursor-pointer hover:border-[var(--primary)]/30 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dapp.color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          dapp.status === 'Available' 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
        }`}>
          {isChinese ? dapp.statusZh : dapp.status}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{dapp.name}</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        {isChinese ? dapp.descriptionZh : dapp.description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          {dapp.isTransfer ? 'Transfer' : 'DApp'}
        </span>
        <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
      </div>
    </motion.div>
  );
};

// ==================== 发现页面 ====================

export const DiscoverPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const isChinese = i18n.language === 'zh';
  
  const filteredDapps = dappCards.filter(dapp => 
    dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dapp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (isChinese && dapp.descriptionZh.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleCardClick = (dapp: typeof dappCards[0]) => {
    if (dapp.isTransfer) {
      // 如果是转账工具，跳转到发送页面
      window.location.href = '/send';
    } else {
      // 其他卡片显示即将开放提示
      showToast(
        isChinese 
          ? `${dapp.name} 即将开放，敬请期待！` 
          : `${dapp.name} is coming soon!`,
        'info'
      );
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">{t('discover.title', 'Discover')}</h1>
            <p className="text-[var(--text-muted)]">
              {isChinese 
                ? '探索 Canton 生态系统中的 DApp 和服务' 
                : 'Explore DApps and services in the Canton ecosystem'
              }
            </p>
          </div>
        </div>
        
        <p className="text-sm text-[var(--text-muted)] mt-4 max-w-3xl">
          {isChinese
            ? '发现并连接 Canton 网络上的顶级去中心化应用。这些服务旨在增强您的机构级钱包体验。'
            : 'Discover and connect with top decentralized applications on the Canton network. These services are designed to enhance your institutional-grade wallet experience.'
          }
        </p>
      </motion.div>
      
      {/* Search Bar */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isChinese ? '搜索 DApp 或服务...' : 'Search DApps or services...'}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 pl-11 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]/50 transition-colors"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Compass className="w-5 h-5" />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Categories */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
          {isChinese ? '所有服务' : 'All Services'}
        </h2>
        
        {filteredDapps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDapps.map((dapp, index) => (
              <motion.div
                key={dapp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              >
                <DAppCard dapp={dapp} onClick={() => handleCardClick(dapp)} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--card)] flex items-center justify-center">
              <Compass className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">
              {isChinese ? '未找到匹配的服务' : 'No matching services found'}
            </h3>
            <p className="text-[var(--text-muted)] max-w-md mx-auto">
              {isChinese
                ? '尝试使用不同的搜索词，或浏览所有可用的 DApp。'
                : 'Try a different search term or browse all available DApps.'
              }
            </p>
          </div>
        )}
      </motion.div>
      
      {/* Coming Soon Section */}
      <motion.div 
        className="mt-12 pt-8 border-t border-[var(--border)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-[var(--text-muted)]" />
          <h2 className="text-lg font-semibold text-[var(--text)]">
            {isChinese ? '即将推出' : 'Coming Soon'}
          </h2>
        </div>
        
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <p className="text-[var(--text-muted)] mb-4">
            {isChinese
              ? '我们正在与 Canton 生态系统中的顶级项目合作，为您带来更多优质服务。'
              : 'We are working with top projects in the Canton ecosystem to bring you more premium services.'
            }
          </p>
          
          <div className="flex flex-wrap gap-3">
            {['DeFi Lending', 'NFT Marketplace', 'Options Trading', 'Insurance', 'Data Analytics', 'DAO Tools'].map((service) => (
              <span 
                key={service}
                className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-muted)]"
              >
                {service}
              </span>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-muted)]">
              {isChinese
                ? '有想要看到的服务吗？通过 feedback@canton.network 告诉我们。'
                : 'Have a service you would like to see? Let us know at feedback@canton.network'
              }
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DiscoverPage;
import React, { useEffect } from 'react';
import Router from './routes';
import { useWalletStore, applyTheme } from './store';
import './i18n';
import './styles/globals.css';

// ==================== 主应用组件 ====================

const App: React.FC = () => {
  const { theme } = useWalletStore();

  // 监听 theme 变化（main.tsx 已做首次初始化，这里只做同步）
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return <Router />;
};

export default App;

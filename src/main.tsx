import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// ==================== 主题最早初始化（防止闪白） ====================
// 在 React 渲染前设置主题，避免首屏闪白
const initializeTheme = () => {
  // 1. 优先读取 localStorage
  const savedTheme = localStorage.getItem('canton-wallet-theme');
  
  // 2. 有保存的主题就用，否则默认 dark（不跟随系统）
  const theme = savedTheme === 'light' || savedTheme === 'dark' 
    ? savedTheme 
    : 'dark';
  
  // 3. 立即设置到 html 元素
  document.documentElement.setAttribute('data-theme', theme);
  
  // 4. 同时设置背景色防止白屏
  document.body.style.backgroundColor = theme === 'dark' ? '#0a0a0f' : '#f2f4f6';
};

// 立即执行主题初始化
initializeTheme();

// ==================== React 渲染 ====================
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assets" element={<PlaceholderPage title="Assets Management" />} />
        <Route path="/assets/:token" element={<PlaceholderPage title="Token Details" />} />
        <Route path="/send" element={<PlaceholderPage title="Send Assets" />} />
        <Route path="/swap" element={<PlaceholderPage title="Swap Tokens" />} />
        <Route path="/batch" element={<PlaceholderPage title="Batch Transfers" />} />
        <Route path="/batch/:id" element={<PlaceholderPage title="Batch Details" />} />
        <Route path="/offers" element={<PlaceholderPage title="Offers" />} />
        <Route path="/activity" element={<PlaceholderPage title="Activity History" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

const LoginPage: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="card p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4">
          <span className="text-2xl text-white">🔐</span>
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Canton Wallet</h1>
        <p className="text-text-secondary">Institutional Custodial Wallet</p>
        <p className="text-sm text-text-muted mt-2">Based on Canton Network • PRD V1</p>
      </div>
      
      <div className="space-y-4">
        <input type="email" className="input w-full" placeholder="Email" />
        <input type="password" className="input w-full" placeholder="Password" />
        <button className="btn-primary w-full py-3">Sign In / Register</button>
      </div>
      
      <div className="mt-6 pt-6 border-t border-border text-center">
        <p className="text-sm text-text-secondary">
          Custodial wallet • Backend signing • Audit logging • Institutional security
        </p>
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="gradient-bg rounded-2xl p-8 border border-border">
      <h1 className="text-3xl font-bold text-text-primary mb-2">$24,850.50</h1>
      <p className="text-text-secondary">Total Portfolio Value • Custodial Wallet</p>
      <div className="flex space-x-3 mt-4">
        <button className="btn-outline">Receive</button>
        <button className="btn-primary">Send</button>
        <button className="btn-secondary">Swap</button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-bold text-text-primary mb-4">Assets</h2>
        {['ETH', 'USDC', 'BTC', 'MATIC'].map((token) => (
          <div key={token} className="flex justify-between p-3 hover:bg-background-hover rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white">{token.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-text-primary">{token}</p>
                <p className="text-sm text-text-secondary">Balance</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-text-primary">$10,000</p>
              <p className="text-sm text-status-success">+2.5%</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card">
        <h2 className="text-xl font-bold text-text-primary mb-4">Recent Activity</h2>
        {[
          { type: 'Send', amount: '1.5 ETH', status: 'Confirmed', time: '2h ago' },
          { type: 'Receive', amount: '5000 USDC', status: 'Pending', time: '1h ago' },
          { type: 'Swap', amount: '0.05 BTC', status: 'Confirmed', time: '1d ago' },
        ].map((tx, i) => (
          <div key={i} className="flex justify-between p-3 hover:bg-background-hover rounded-xl">
            <div>
              <p className="font-medium text-text-primary">{tx.type}</p>
              <p className="text-sm text-text-secondary">{tx.amount}</p>
            </div>
            <div className="text-right">
              <span className={`tag ${tx.status === 'Confirmed' ? 'tag-success' : 'tag-warning'}`}>
                {tx.status}
              </span>
              <p className="text-sm text-text-secondary mt-1">{tx.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="card">
      <h2 className="text-xl font-bold text-text-primary mb-4">PRD V1 Features</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '↗️', label: 'Send', desc: 'Single transfers' },
          { icon: '🔄', label: 'Swap', desc: 'Token exchange' },
          { icon: '👥', label: 'Batch', desc: 'Mass transfers' },
          { icon: '🎁', label: 'Offers', desc: 'Canton offers' },
        ].map((feature, i) => (
          <div key={i} className="text-center p-4 bg-background-hover rounded-xl">
            <div className="text-2xl mb-2">{feature.icon}</div>
            <p className="font-medium text-text-primary">{feature.label}</p>
            <p className="text-sm text-text-secondary">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
    
    <div className="card">
      <h2 className="text-xl font-bold text-text-primary mb-4">V2 Features (Coming Soon)</h2>
      <div className="flex flex-wrap gap-3">
        {['NFT', 'Bridge', 'Staking', 'Multisig', 'IM'].map((feature) => (
          <span key={feature} className="px-4 py-2 bg-background-hover rounded-xl text-text-secondary">
            {feature}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6">
    <div className="card">
      <h1 className="text-2xl font-bold text-text-primary mb-4">{title}</h1>
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-background-hover rounded-2xl mb-4">
          <span className="text-3xl">🚧</span>
        </div>
        <p className="text-text-secondary">Page under development</p>
        <p className="text-sm text-text-muted mt-2">Full PRD functionality coming soon</p>
      </div>
    </div>
  </div>
);

export default App;
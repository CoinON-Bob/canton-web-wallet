import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Book, 
  User, 
  Wallet, 
  Edit2, 
  Trash2, 
  Plus,
  Copy,
  Search
} from 'lucide-react';
import { Card } from '../../components/ui';

// ==================== Mock 地址数据 ====================

const mockAddresses = [
  {
    id: '1',
    name: 'Alice Johnson',
    address: '0x742d35Cc6634C0532925a3b844Bc9eC37c56b9d3',
    note: 'Business partner',
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Bob Smith',
    address: '0x8e8c7c8b9a2b1c3d4e5f6a7b8c9d0e1f2a3b4c5d',
    note: 'Friend',
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Canton Exchange',
    address: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
    note: 'Trading platform',
    isFavorite: true,
  },
  {
    id: '4',
    name: 'David Wilson',
    address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
    note: 'Family',
    isFavorite: false,
  },
  {
    id: '5',
    name: 'Eve Davis',
    address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
    note: 'Colleague',
    isFavorite: false,
  },
];

// ==================== 地址簿页面 ====================

export const SettingsAddressBookPage: React.FC = () => {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState(mockAddresses);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    note: '',
  });

  // 从 localStorage 加载地址
  useEffect(() => {
    const savedAddresses = localStorage.getItem('canton_address_book');
    if (savedAddresses) {
      try {
        setAddresses(JSON.parse(savedAddresses));
      } catch (error) {
        console.error('Failed to load addresses:', error);
      }
    }
  }, []);

  // 保存地址到 localStorage
  const saveAddresses = (updatedAddresses: typeof mockAddresses) => {
    setAddresses(updatedAddresses);
    localStorage.setItem('canton_address_book', JSON.stringify(updatedAddresses));
  };

  const filteredAddresses = addresses.filter(addr =>
    addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAddress = () => {
    if (!newAddress.name.trim() || !newAddress.address.trim()) {
      alert('Please fill in name and address');
      return;
    }

    const newAddr = {
      id: Date.now().toString(),
      ...newAddress,
      isFavorite: false,
    };

    const updatedAddresses = [...addresses, newAddr];
    saveAddresses(updatedAddresses);
    setNewAddress({ name: '', address: '', note: '' });
    setShowAddForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      saveAddresses(updatedAddresses);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updatedAddresses = addresses.map(addr =>
      addr.id === id ? { ...addr, isFavorite: !addr.isFavorite } : addr
    );
    saveAddresses(updatedAddresses);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    // 这里可以添加 toast 提示
    console.log('Address copied:', address);
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
            <Book className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">
              {t('settings.addressBook')}
            </h1>
            <p className="text-[var(--text-muted)]">
              {t('settings.addressBookDesc')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 搜索和添加按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by name, address, or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Address
        </button>
      </motion.div>

      {/* 添加地址表单 */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
              Add New Address
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  placeholder="Enter contact name"
                  className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Wallet Address *
                </label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={newAddress.note}
                  onChange={(e) => setNewAddress({ ...newAddress, note: e.target.value })}
                  placeholder="Add a note..."
                  className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddAddress}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* 地址列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[var(--text)]">
              Saved Addresses ({filteredAddresses.length})
            </h3>
            <div className="text-sm text-[var(--text-muted)]">
              {addresses.filter(a => a.isFavorite).length} favorites
            </div>
          </div>

          {filteredAddresses.length === 0 ? (
            <div className="text-center py-12">
              <Book className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium text-[var(--text)] mb-2">
                No addresses found
              </h4>
              <p className="text-[var(--text-muted)]">
                {searchQuery ? 'Try a different search term' : 'Add your first address to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAddresses.map((address, index) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-[var(--text)]">
                          {address.name}
                        </h4>
                        {address.isFavorite && (
                          <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs rounded-full">
                            Favorite
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-mono text-[var(--text-muted)] mb-1">
                        {address.address.slice(0, 16)}...{address.address.slice(-8)}
                      </p>
                      {address.note && (
                        <p className="text-sm text-[var(--text-muted)]">
                          {address.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(address.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        address.isFavorite
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'hover:bg-[var(--card-hover)] text-[var(--text-muted)]'
                      }`}
                      title={address.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() => handleCopyAddress(address.address)}
                      className="p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors text-[var(--text-muted)]"
                      title="Copy address"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => console.log('Edit address:', address.id)}
                      className="p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors text-[var(--text-muted)]"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* 使用提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-600/5 border border-green-500/20">
          <div className="flex items-start gap-3">
            <Book className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-[var(--text)] mb-2">
                Address Book Tips
              </h4>
              <ul className="space-y-1.5 text-sm text-[var(--text-muted)]">
                <li>• Add frequently used addresses to save time on transactions</li>
                <li>• Mark important addresses as favorites for quick access</li>
                <li>• Always double-check addresses before sending funds</li>
                <li>• Use notes to remember the purpose of each address</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsAddressBookPage;
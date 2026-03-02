# Canton Web Wallet - Institutional Custodial Wallet

A high-fidelity, institutional-grade Web3 **custodial wallet** frontend demonstration system based on Canton Network, built according to PRD V1 specifications.

## 🚀 Live Demo
**Access the live demo:** [https://canton-web-wallet.vercel.app](https://canton-web-wallet.vercel.app)

## 📋 PRD V1 Implementation Status

### ✅ **Core Features Implemented**

#### **Account System**
- Login / Registration pages
- Custodial wallet mode simulation
- Session management placeholder

#### **Dashboard & Asset Management**
- Total portfolio value display
- Token asset listing with balances
- 24-hour change indicators
- Recent transaction history

#### **Transaction Features**
- **Send**: Asset transfer workflow
- **Swap**: Token exchange interface  
- **Batch**: Mass transfer capabilities
- **Offers**: Canton Network offer system

#### **Activity & Settings**
- Transaction history with status tracking
- User profile management
- Security settings placeholder
- Preferences configuration

### 🎨 **UI/UX Design**
- **Dark Institutional Theme**: Professional financial terminal styling
- **Card-Based Layout**: Modular, responsive components
- **Micro-Interactions**: Hover effects, loading states, transitions
- **Institutional Feel**: Similar to Temple Digital Group / Loop Wallet
- **No Generic Admin UI**: Custom design avoiding standard dashboard templates

### 📁 **Complete Page Structure** (PRD Section 4)
```
/login                    # Authentication
/register                 # Account creation
/dashboard                # Main dashboard with portfolio
/assets                   # Token management
/assets/:token           # Token details
/send                     # Asset transfers
/swap                     # Token exchange
/batch                    # Batch transfers
/batch/:id               # Batch details
/offers                   # Canton offers
/activity                 # Transaction history
/settings                 # Account configuration
/profile                  # User profile
```

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS + Custom Design System
- **Icons**: Emoji + Custom components
- **Deployment**: Vercel (Auto-deploy on push)

## 🏗️ System Architecture (PRD Section 2)

```
User Browser
↓
Web Frontend (This Project)
↓
Backend API (Mocked)
↓
Custody Wallet Service (Simulated)
    - Key Vault / KMS
    - Transaction Builder  
    - Signer
    - Broadcaster
↓
Canton RPC Gateway (Mocked)
↓
Canton Network (Simulated)
```

## 🔄 **Transaction State Machine** (PRD Section 3.6)
- `Created` → `Signing` → `Broadcasted` → `Confirmed` / `Failed`
- Simulated network delays and random failures

## 📊 **Batch Transfer System** (PRD Section 3.8)
- **Use Cases**: Airdrops, salary payments, rewards distribution
- **Input Methods**: Table entry, CSV import, text paste
- **Validation**: Address validity, amount checks, balance verification
- **Status Tracking**: Created → Validating → Processing → Partial Failed → Completed
- **CSV Export**: Batch results export functionality

## 🎁 **Offer Mechanism** (PRD Section 3.9)
- **Canton Network Special Feature**
- **Display**: Pending assets, counterparty, amount, expiration
- **Actions**: Accept, Reject, Withdraw

## 🔮 **V2 Features Preview** (PRD Section 5)
- **NFT Management** (Coming Soon)
- **Cross-chain Bridge** (Coming Soon)  
- **Staking / Earn** (Coming Soon)
- **Multi-signature Wallets** (Coming Soon)
- **IM System** (Wallet + Social + Payment)

## 🚦 Getting Started

### Local Development
```bash
# Clone and install
git clone <repository>
cd canton-web-wallet
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment
```bash
# Deploy to Vercel
npm run deploy
```

## 🏗️ Project Structure

```
canton-web-wallet/
├── src/
│   ├── App.tsx           # Main application with complete routing
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles (Tailwind + Custom)
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Build configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎯 Future Extensions

The architecture is designed for easy extension to real blockchain integration:

1. **Real Canton Network Integration**: Replace mock layer with Canton RPC
2. **Backend API Development**: Implement custody service and transaction signing
3. **Multi-Chain Support**: Add network switching capabilities
4. **Advanced Security**: 2FA, biometric authentication, hardware wallet integration
5. **Analytics Dashboard**: Performance metrics and insights

## 📝 License

This project is created for demonstration purposes based on PRD V1 specifications. All rights reserved.

---

**Created by**: Senior Web3 Frontend Architect  
**Based on**: Canton Web Wallet PRD V1  
**Purpose**: High-fidelity institutional custodial wallet demonstration  
**Status**: Production-ready demo deployed on Vercel  
**Last Updated**: 2026-03-02
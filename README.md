# Sellify - Crypto Seller for Digital Goods

Sellify is a lightweight, creator-first platform that lets anyone sell digital goods (ebooks, templates, newsletters, access links) using simple on-chain pay links. Creators connect a wallet, add a product, and Sellify generates a public payment URL. Buyers open the URL, pay with a wallet (USDC on Base), and on success they receive the download/access link.

## Features

- 🚀 **Instant crypto payouts** - Receive USDC directly to your wallet
- 🛡️ **No KYC or chargebacks** - Crypto payments are final and secure
- 🔗 **Simple pay links** - Share a single link anywhere
- ⛓️ **Transparent onchain fees** - Low 2% platform fee with all transactions visible on blockchain
- 📱 **Mobile-friendly** - Works on all devices
- 🎨 **Modern UI** - Built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Web3**: wagmi, RainbowKit, ethers.js
- **Database**: Supabase (PostgreSQL)
- **Smart Contracts**: Solidity, Hardhat
- **Blockchain**: Base (Ethereum L2)
- **Deployment**: Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd sellify
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Blockchain
NEXT_PUBLIC_PAY_SPLITTER_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# USDC Token Addresses
NEXT_PUBLIC_USDC_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_USDC_BASE_SEPOLIA=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Platform
PLATFORM_RECEIVER=your_platform_wallet_address_here
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `db/schema.sql` in your Supabase SQL editor
3. Copy your project URL and anon key to the environment variables

### 4. Deploy Smart Contract

```bash
# Compile contracts
npm run compile

# Deploy to Base Sepolia testnet
npm run deploy

# Deploy to Base mainnet (when ready)
npm run deploy:mainnet
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
sellify/
├── contracts/           # Smart contracts
│   └── PaySplitter.sol
├── scripts/            # Deployment scripts
│   └── deploy.ts
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── api/        # API routes
│   │   ├── create/     # Product creation page
│   │   ├── dashboard/  # Creator dashboard
│   │   └── p/[slug]/   # Payment pages
│   └── lib/            # Utilities and types
├── db/                 # Database schema
│   └── schema.sql
└── hardhat.config.ts   # Hardhat configuration
```

## How It Works

### For Creators

1. **Connect Wallet** - Connect your crypto wallet (MetaMask, WalletConnect, etc.)
2. **Create Product** - Upload your digital file and set a price in USDC
3. **Share Link** - Get a unique pay link to share anywhere
4. **Get Paid** - Receive USDC directly to your wallet (minus 2% platform fee)

### For Buyers

1. **Open Pay Link** - Click on a Sellify pay link
2. **Connect Wallet** - Connect your crypto wallet
3. **Approve & Pay** - Approve USDC spending and complete payment
4. **Download** - Get instant access to the digital product

## Smart Contract

The `PaySplitter` contract handles payment processing and fee splitting:

- Accepts USDC payments
- Automatically splits payments (98% to creator, 2% to platform)
- Emits events for payment tracking
- Gas-efficient implementation

## API Endpoints

- `POST /api/products` - Create a new product
- `GET /api/products/[slug]` - Get product details
- `POST /api/payments` - Record a payment
- `POST /api/downloads` - Track file downloads

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Smart Contract

1. Deploy to Base Sepolia testnet first
2. Test thoroughly
3. Deploy to Base mainnet
4. Verify contract on BaseScan

### Database

1. Create Supabase project
2. Run schema migration
3. Set up Row Level Security policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [Coming Soon]
- Discord: [Coming Soon]
- Twitter: [Coming Soon]

## Roadmap

- [ ] Multi-token support (USDT, ETH)
- [ ] Custom domains for creators
- [ ] Advanced analytics
- [ ] Subscription products
- [ ] Mobile app
- [ ] API for third-party integrations

---

Built with ❤️ for the crypto creator economy
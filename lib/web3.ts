import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

// Check if we have a valid WalletConnect project ID
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
const hasValidProjectId = projectId && projectId !== 'YOUR_PROJECT_ID' && projectId.length > 10;

// Log helpful message for development
if (typeof window !== 'undefined' && !hasValidProjectId) {
  console.warn(
    '🔧 WalletConnect Setup Required:\n' +
    '1. Get a project ID from https://cloud.walletconnect.com/\n' +
    '2. Create .env.local with: NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id\n' +
    '3. Restart the dev server\n' +
    'This will eliminate the connection errors you see in the console.'
  );
}

export const config = getDefaultConfig({
  appName: '0ja',
  projectId: hasValidProjectId ? projectId : 'demo-project-id',
  chains: [base, baseSepolia],
  ssr: true,
  // Only add walletConnectParameters if we have a valid project ID
  ...(hasValidProjectId && {
    walletConnectParameters: {
      projectId: projectId,
      relayUrl: 'wss://relay.walletconnect.org',
      metadata: {
        name: '0ja',
        description: 'Crypto payment links for digital goods',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        icons: ['https://0ja.app/icon.png'],
      },
    },
  }),
});

export const PAY_SPLITTER_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_platformFeeBps", "type": "uint256"},
      {"internalType": "address", "name": "_platformReceiver", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "productId", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "token", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "platformFee", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "creatorAmount", "type": "uint256"},
      {"indexed": false, "internalType": "bytes32", "name": "txHash", "type": "bytes32"}
    ],
    "name": "PaymentReceived",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "productId", "type": "bytes32"},
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "payERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "productId", "type": "bytes32"},
      {"internalType": "address", "name": "creator", "type": "address"}
    ],
    "name": "payETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFeeBps",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformReceiver",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const USDC_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

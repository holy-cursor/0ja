'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Download
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  type: 'payment' | 'payout' | 'refund';
  amount: number;
  token: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  timestamp: string;
  txHash?: string;
}

interface WalletData {
  address: string;
  balance: number;
  token: string;
  connected: boolean;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData>({
    address: '',
    balance: 0,
    token: 'USDC',
    connected: false
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const fetchWalletData = async () => {
    try {
      // Check if wallet is connected
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWallet({
            address: accounts[0],
            balance: 1250.75, // Mock balance
            token: 'USDC',
            connected: true
          });
        }
      }
      
      // Mock transaction data
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'payment',
          amount: 25.00,
          token: 'USDC',
          status: 'completed',
          description: 'Digital Art Collection',
          timestamp: new Date().toISOString(),
          txHash: '0x1234...5678'
        },
        {
          id: '2',
          type: 'payout',
          amount: 24.50,
          token: 'USDC',
          status: 'completed',
          description: 'Creator payout',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          txHash: '0x5678...9abc'
        }
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts.length > 0) {
          setWallet({
            address: accounts[0],
            balance: 1250.75,
            token: 'USDC',
            connected: true
          });
          setShowConnectModal(false);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'payout':
        return <ArrowUpRight className="w-4 h-4 text-secondary" />;
      case 'refund':
        return <ArrowUpRight className="w-4 h-4 text-coral" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent-2/20 text-green-600';
      case 'pending':
        return 'bg-accent-1/20 text-accent-1';
      case 'failed':
        return 'bg-primary/20 text-coral';
      default:
        return 'bg-tertiary/10 text-gray-900';
    }
  };

  const totalEarnings = transactions
    .filter(t => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayouts = transactions
    .filter(t => t.type === 'payout' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayouts = transactions
    .filter(t => t.type === 'payout' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="relative min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white py-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,90,118,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(201,160,255,0.12),transparent_45%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(31,31,31,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,31,31,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet & Payments</h1>
          <p className="text-gray-900/70 mt-1 dark:text-gray-300">Manage your earnings and crypto payments</p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[#C9A0FF]/30 dark:border-white/10 rounded-2xl shadow-xl mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#9FFFCB]/30 rounded-lg">
                  <Wallet className="w-6 h-6 text-[#C9A0FF]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1F1F1F] dark:text-white">Wallet Connection</h2>
                  <p className="opacity-70 dark:text-gray-300">
                    {wallet.connected 
                      ? 'Your wallet is connected and ready for payments'
                      : 'Connect your wallet to receive payments'
                    }
                  </p>
                </div>
              </div>
              
              {wallet.connected ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm opacity-70 dark:text-gray-300">Connected Address</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm text-[#1F1F1F] dark:text-white">{formatAddress(wallet.address)}</p>
                      <button
                        onClick={copyAddress}
                        className="p-1 text-[#1F1F1F] dark:text-white hover:opacity-90"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[#FF5A76] hover:opacity-90 text-white rounded-lg transition flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="bg-[#FF5A76] hover:opacity-90 text-white px-4 py-2 rounded-lg transition"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Balance Overview */}
        {wallet.connected && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-xl p-6 shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[#C9A0FF]/30 dark:border-white/10">
              <div className="flex items-center">
                <div className="p-2 bg-[#9FFFCB]/30 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[#C9A0FF]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-70 dark:text-gray-300">Wallet Balance</p>
                  <p className="text-2xl font-bold text-[#1F1F1F] dark:text-white">{wallet.balance} {wallet.token}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[#C9A0FF]/30 dark:border-white/10">
              <div className="flex items-center">
                <div className="p-2 bg-[#7EC8E3]/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-[#C9A0FF]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-70 dark:text-gray-300">Total Earnings</p>
                  <p className="text-2xl font-bold text-[#1F1F1F] dark:text-white">${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[#C9A0FF]/30 dark:border-white/10">
              <div className="flex items-center">
                <div className="p-2 bg-[#C9A0FF]/30 rounded-lg">
                  <ArrowUpRight className="w-6 h-6 text-[#C9A0FF]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-70 dark:text-gray-300">Total Payouts</p>
                  <p className="text-2xl font-bold text-[#1F1F1F] dark:text-white">${totalPayouts.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[#C9A0FF]/30 dark:border-white/10">
              <div className="flex items-center">
                <div className="p-2 bg-[#FFF685]/60 rounded-lg">
                  <Clock className="w-6 h-6 text-[#C9A0FF]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-70 dark:text-gray-300">Pending</p>
                  <p className="text-2xl font-bold text-[#1F1F1F] dark:text-white">${pendingPayouts.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[#C9A0FF]/30 dark:border-white/10 rounded-2xl shadow-xl">
          <div className="p-6 border-b border-[#C9A0FF]/30 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1F1F1F] dark:text-white">Transaction History</h2>
              <button className="flex items-center text-sm text-[#1F1F1F] dark:text-white hover:opacity-90">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-[#FF5A76] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="opacity-70 dark:text-gray-300">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1F1F1F] dark:text-white mb-2">No transactions yet</h3>
                <p className="opacity-70 dark:text-gray-300">Your transaction history will appear here once you start selling products.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-white/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium opacity-70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#1F1F1F] dark:text-white capitalize">
                              {transaction.type}
                            </div>
                            <div className="text-sm opacity-70 dark:text-gray-300">{transaction.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          transaction.type === 'payment' ? 'text-green-600' : 'text-[#FF5A76]'
                        }`}>
                          {transaction.type === 'payment' ? '-' : '+'}${transaction.amount.toFixed(2)} {transaction.token}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70 dark:text-gray-300">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {transaction.txHash && (
                          <button className="text-[#FF5A76] hover:opacity-90 flex items-center">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Connect Wallet Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-xl border border-[#C9A0FF]/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="p-3 bg-[#9FFFCB]/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-[#C9A0FF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#333333] mb-2">Connect Your Wallet</h3>
                <p className="opacity-70 mb-6">
                  Connect your wallet to receive payments and manage your earnings.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={connectWallet}
                    className="w-full bg-[#FF6F61] hover:opacity-90 text-white py-3 rounded-lg transition"
                  >
                    Connect MetaMask
                  </button>
                  <button
                    onClick={() => setShowConnectModal(false)}
                    className="w-full border border-white/60 bg-white/70 text-gray-800 py-3 rounded-lg hover:bg-white transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


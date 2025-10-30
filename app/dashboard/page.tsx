'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { 
  Package, 
  Plus, 
  Wallet,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  X
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  price_amount: number;
  price_token: string;
  image_url?: string;
  slug: string;
  created_at: string;
  sales_count?: number;
  revenue?: number;
  status: 'active' | 'draft' | 'paused';
}

export default function Dashboard() {
  const { isLoaded, user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmptyStateModal, setShowEmptyStateModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWalletCheckModal, setShowWalletCheckModal] = useState(false);

  const connectWallet = async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        // Refresh products after wallet connection
        await fetchDashboardData();
        // After connecting wallet and fetching products, check if we should show empty state
        // This will be handled by the useEffect that watches products.length, but we trigger it
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const handleCreateClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if wallet is connected
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          window.location.href = '/create';
        } else {
          setShowWalletCheckModal(true);
        }
      } catch {
        setShowWalletCheckModal(true);
      }
    } else {
      setShowWalletCheckModal(true);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get wallet address to filter products
      let walletAddress = null;
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          walletAddress = accounts?.[0];
        } catch (err) {
          console.error('Failed to get wallet:', err);
        }
      }
      
      // Fetch products filtered by wallet address
      const url = walletAddress 
        ? `/api/products?creator_wallet=${encodeURIComponent(walletAddress)}`
        : '/api/products';
      
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      
      const apiProducts: Product[] = (data?.products || []).map((p: any) => ({
        id: String(p.id ?? ''),
        title: p.title ?? '',
        description: p.description ?? '',
        price_amount: p.price_amount ?? 0,
        price_token: p.price_token ?? 'USDC',
        image_url: p.image_url || undefined,
        slug: p.slug ?? '',
        created_at: p.created_at ?? new Date().toISOString(),
        sales_count: p.sales_count ?? 0, // Use from API
        revenue: p.revenue ?? 0, // Use from API
        status: p.paused ? 'paused' : 'active',
      }));
      
      setProducts(apiProducts);
      
      // Log for debugging
      if (walletAddress) {
        console.log(`Fetched ${apiProducts.length} products for wallet: ${walletAddress}`);
      } else {
        console.log('No wallet connected, showing all products (will be empty if none)');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchDashboardData();
    
    // Listen for wallet connection changes and refresh products
    const handleAccountsChanged = () => {
      fetchDashboardData();
    };
    
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    return () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Show empty state modal if user has no products (regardless of wallet connection)
  useEffect(() => {
    if (!loading && products.length === 0) {
      // Show empty state modal - it will handle wallet connection if needed
      setShowEmptyStateModal(true);
    } else if (products.length > 0) {
      // User has products, don't show empty state
      setShowEmptyStateModal(false);
    }
  }, [loading, products.length]);

  // Show loading state while Clerk is checking authentication
  if (!isLoaded) {
    return (
      <div className="relative min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!user) {
    return (
      <div className="relative min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to access dashboard</h1>
            <Link 
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white bg-coral hover:bg-coral/90 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = products.reduce((sum, product) => sum + (product.revenue || 0), 0);
  const totalSales = products.reduce((sum, product) => sum + (product.sales_count || 0), 0);
  const activeProducts = products.filter(p => p.status === 'active').length;

  return (
    <div className="relative min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,90,118,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(201,160,255,0.12),transparent_45%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(31,31,31,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,31,31,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
      </div>
      <div className="bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back!</p>
            </div>
            
            <div className="flex items-center space-x-4 flex-wrap gap-3">
              {false ? (
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Wallet Connected</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-coral text-white rounded-lg transition hover:bg-coral/90"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
              
              <button
                onClick={handleCreateClick}
                className="flex items-center space-x-2 px-4 py-2 bg-coral text-white rounded-lg transition hover:bg-coral/90"
              >
                <Plus className="w-4 h-4" />
                <span>Create Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900/60 dark:text-gray-300">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900/60 dark:text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900/60 dark:text-gray-300">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSales}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 shadow-sm bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900/60 dark:text-gray-300">Active Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeProducts}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl">
          <div className="p-6 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Products</h2>
              <Link
                href="/dashboard"
                className="text-coral hover:text-coral/80 font-medium flex items-center"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-900/60 dark:text-gray-300">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products yet</h3>
                <p className="text-gray-900/70 dark:text-gray-300 mb-6">Create your first product to start earning.</p>
                <button
                  onClick={handleCreateClick}
                  className="inline-flex items-center px-6 py-3 bg-coral text-white rounded-lg font-medium transition hover:bg-coral/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 6).map((product) => (
                  <div key={product.id} className="border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:shadow-md hover:border-accent-2/30 transition-all">
                    <div className="flex items-start space-x-4">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          width={60}
                          height={60}
                          className="w-15 h-15 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                  <div className="w-15 h-15 bg-accent-1/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.title}</h3>
                        <p className="text-sm text-gray-900/60 dark:text-gray-300 mb-2">{product.price_amount} {product.price_token}</p>
                        <div className="flex items-center justify-between text-sm text-gray-900/50 dark:text-gray-400">
                          <span>{product.sales_count || 0} sales</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-600'
                              : product.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-tertiary/10 text-gray-900'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link
                        href={`/dashboard/products/${product.slug}`}
                        className="text-coral hover:text-coral/80 text-sm font-medium"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEmptyStateModal && (
          <motion.div 
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gray-50"></div>

            <motion.div 
              className="relative flex items-center justify-center min-h-screen p-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <motion.div 
                className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-200"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-[#C9A0FF]" />
                </div>
                <h3 className="text-xl font-semibold text-[#333333] mb-2">Welcome to 0ja!</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any products yet. Let's create your first one and start earning!
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      setShowEmptyStateModal(false);
                      
                      // Check if wallet is connected
                      if (typeof window !== 'undefined' && (window as any).ethereum) {
                        try {
                          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
                          if (accounts && accounts.length > 0) {
                            window.location.href = '/create';
                          } else {
                            setShowWalletCheckModal(true);
                          }
                        } catch {
                          setShowWalletCheckModal(true);
                        }
                      } else {
                        setShowWalletCheckModal(true);
                      }
                    }}
                    className="w-full bg-[#FF6F61] text-white py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Product
                  </button>
                  <button
                    onClick={() => setShowEmptyStateModal(false)}
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </motion.div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Connection Modal */}
      <AnimatePresence>
      {showWalletModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowWalletModal(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowWalletModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              <div className="p-8 text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-12 h-12 text-coral" />
                </div>

                {/* Title & Description */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-600 mb-6">
                  Connect your wallet to view your products, receive payments, and manage your earnings securely.
                </p>

                {/* Features */}
                <div className="space-y-2 mb-8">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-coral rounded-full"></div>
                    <span>View and manage your products</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-coral rounded-full"></div>
                    <span>Receive payments in crypto</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-coral rounded-full"></div>
                    <span>Instant settlements</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-coral rounded-full"></div>
                    <span>No bank accounts needed</span>
                  </div>
                </div>

                {/* Connect Wallet Button */}
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      await connectWallet();
                      setShowWalletModal(false);
                    }}
                    className="w-full px-6 py-3 bg-coral text-white rounded-lg font-medium hover:opacity-90 transition"
                  >
                    Connect MetaMask
                  </button>

                  <button
                    onClick={() => setShowWalletModal(false)}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-500 mt-6">
                  By connecting, you agree to receive payments via your connected wallet.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Check Modal */}
      {showWalletCheckModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-coral" />
            </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Connect Your Wallet First
              </h2>
            <p className="text-gray-600 mb-6">
                You need to connect your wallet before creating a product to receive payments.
            </p>
            <div className="space-y-3">
              <button
                  onClick={async () => {
                    try {
                      if (typeof window !== 'undefined' && (window as any).ethereum) {
                        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                        setShowWalletCheckModal(false);
                        window.location.href = '/create';
                      }
                    } catch (error) {
                      console.error('Failed to connect wallet:', error);
                    }
                  }}
                  className="w-full px-6 py-3 bg-coral text-white rounded-lg font-medium hover:opacity-90 transition"
              >
                Connect MetaMask
              </button>
              <button
                  onClick={() => setShowWalletCheckModal(false)}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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
  ExternalLink
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

  const connectWallet = async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: '1',
          title: 'Digital Art Collection',
          description: 'High-quality digital artwork',
          price_amount: 25.00,
          price_token: 'USDC',
          image_url: '/placeholder-art.jpg',
          slug: 'digital-art-collection',
          created_at: new Date().toISOString(),
          sales_count: 12,
          revenue: 300.00,
          status: 'active'
        },
        {
          id: '2',
          title: 'Music Track Pack',
          description: 'Royalty-free music tracks',
          price_amount: 15.00,
          price_token: 'USDC',
          image_url: '/placeholder-music.jpg',
          slug: 'music-track-pack',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          sales_count: 8,
          revenue: 120.00,
          status: 'active'
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchDashboardData();
  }, []);

  // Show empty state modal if user has no products
  useEffect(() => {
    if (!loading && products.length === 0) {
      setShowEmptyStateModal(true);
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
              
              <Link
                href="/create"
                className="flex items-center space-x-2 px-4 py-2 bg-coral text-white rounded-lg transition hover:bg-coral/90"
              >
                <Plus className="w-4 h-4" />
                <span>Create Product</span>
              </Link>
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
                <Link
                  href="/create"
                  className="inline-flex items-center px-6 py-3 bg-coral text-white rounded-lg font-medium transition hover:bg-coral/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Product
                </Link>
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
                        href={`/p/${product.slug}`}
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
                  <Link
                    href="/create"
                    onClick={() => setShowEmptyStateModal(false)}
                    className="w-full bg-[#FF6F61] text-white py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Product
                  </Link>
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

      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-[#C9A0FF]" />
            </div>
            <h3 className="text-xl font-semibold text-[#333333] mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-6">
              Connect your crypto wallet to receive payments and manage your earnings securely.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={async () => { await connectWallet(); setShowWalletModal(false); }}
                className="w-full bg-[#FF6F61] text-white py-3 rounded-lg transition hover:opacity-90 flex items-center justify-center"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </button>
              <button
                onClick={() => setShowWalletModal(false)}
                className="w-full border border-white/60 bg-white/70 text-gray-800 py-3 rounded-lg hover:bg-white transition"
              >
                Cancel
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
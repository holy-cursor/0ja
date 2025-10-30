'use client';

import { useState, useEffect, use } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Copy, 
  ExternalLink, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  Calendar,
  Package,
  CheckCircle
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price_amount: number;
  price_token: string;
  image_url?: string;
  slug: string;
  created_at: string;
  file_url: string;
  creator_wallet: string;
}

interface Payment {
  id: string;
  product_id: string;
  buyer_wallet: string;
  amount: number;
  creator_amount: number;
  token: string;
  tx_hash: string;
  confirmed_at: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { isLoaded, user } = useUser();
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesCount, setSalesCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        
        // Get wallet address
        let walletAddress = null;
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          try {
            const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
            walletAddress = accounts?.[0];
          } catch (err) {
            console.error('Failed to get wallet:', err);
          }
        }

        // Fetch product
        const productRes = await fetch(`/api/products/${resolvedParams.slug}`, { cache: 'no-store' });
        if (!productRes.ok) throw new Error('Failed to fetch product');
        const productData = await productRes.json();
        
        const fetchedProduct = productData.product;
        
        // Verify the product belongs to the connected wallet
        if (walletAddress && fetchedProduct.creator_wallet.toLowerCase() !== walletAddress.toLowerCase()) {
          throw new Error('You do not have permission to view this product');
        }
        
        setProduct(fetchedProduct);

        // Fetch payments for this specific product
        if (fetchedProduct.id) {
          const paymentsRes = await fetch(`/api/payments?product_id=${encodeURIComponent(fetchedProduct.id)}`, { cache: 'no-store' });
          if (paymentsRes.ok) {
            const paymentsData = await paymentsRes.json();
            const productPayments = paymentsData.payments || [];
            setPayments(productPayments);
            
            // Calculate stats
            const count = productPayments.length;
            const revenue = productPayments.reduce((sum: number, p: any) => sum + parseFloat(p.creator_amount || 0), 0);
            setSalesCount(count);
            setTotalRevenue(revenue);
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchProductDetails();
    }
  }, [resolvedParams.slug, isLoaded]);

  const copyProductLink = () => {
    if (product) {
      const productUrl = `${window.location.origin}/p/${product.slug}`;
      navigator.clipboard.writeText(productUrl);
      alert('Product link copied to clipboard!');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view product details</h1>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white bg-coral hover:bg-coral/90 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white bg-coral hover:bg-coral/90 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const productUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${product.slug}`;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info Card */}
            <div className="bg-white dark:bg-white/5 rounded-lg shadow-sm border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.title}</h2>
              </div>
              
              {product.image_url && (
                <div className="mb-6">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                  <p className="text-gray-900 dark:text-white">{product.description || 'No description provided.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.price_amount} {product.price_token}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Payment Link</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={productUrl}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyProductLink}
                      className="px-4 py-2 bg-coral text-white rounded-lg hover:bg-coral/90 transition flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <Link
                      href={`/p/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Preview</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sales */}
            {payments.length > 0 ? (
              <div className="bg-white dark:bg-white/5 rounded-lg shadow-sm border border-gray-200 dark:border-white/10 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Sales</h2>
                <div className="space-y-3">
                  {payments.slice(0, 10).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.buyer_wallet.slice(0, 6)}...{payment.buyer_wallet.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(payment.confirmed_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {payment.creator_amount} {payment.token}
                        </p>
                        <a
                          href={`https://etherscan.io/tx/${payment.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-coral hover:underline"
                        >
                          View Tx
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-white/5 rounded-lg shadow-sm border border-gray-200 dark:border-white/10 p-6">
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No sales yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Sales will appear here once customers make purchases</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white dark:bg-white/5 rounded-lg shadow-sm border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="w-5 h-5 text-coral" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{salesCount}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-coral" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {totalRevenue.toFixed(2)} {product.price_token}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-coral" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Average Sale</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {salesCount > 0 ? (totalRevenue / salesCount).toFixed(2) : '0.00'} {product.price_token}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white dark:bg-white/5 rounded-lg shadow-sm border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Product ID</span>
                  <span className="font-mono text-xs text-gray-900 dark:text-white">{product.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Slug</span>
                  <span className="font-mono text-xs text-gray-900 dark:text-white">{product.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


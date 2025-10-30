'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Download, 
  File, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  Eye
} from 'lucide-react';

interface AccessRecord {
  productId: string;
  buyerWallet: string;
  txHash: string;
  accessToken: string;
  grantedAt: string;
  expiresAt: string;
  downloadCount: number;
}

interface Product {
  id: string;
  title: string;
  description: string;
  file_url: string;
  image_url?: string;
  price_amount: number;
  price_token: string;
}

export default function DownloadPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [access, setAccess] = useState<AccessRecord | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchAccess();
    }
  }, [token]);

  const fetchAccess = async () => {
    try {
      const response = await fetch(`/api/files/access?token=${token}`);
      const data = await response.json();

      if (data.success) {
        setAccess(data.access);
        // Fetch product details using slug
        await fetchProduct(data.access.productSlug);
      } else {
        setError(data.error || 'Failed to verify access');
      }
    } catch (err) {
      setError('Failed to verify file access');
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async (productSlug: string) => {
    try {
      const response = await fetch(`/api/products/${productSlug}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.product);
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
    }
  };

  const handleDownload = async () => {
    if (!product?.file_url || !token) return;

    setDownloading(true);
    
    try {
      // Get signed URL for private file
      const filePath = product.file_url.startsWith('product-files/') 
        ? product.file_url 
        : `product-files/${product.file_url.split('/').pop()}`;

      const signedUrlResponse = await fetch('/api/files/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filePath,
          accessToken: token
        })
      });

      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json();
        throw new Error(errorData.error || 'Failed to get download URL');
      }

      const { signedUrl } = await signedUrlResponse.json();

      // Track download
      await fetch('/api/files/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken: token,
          productId: product.id 
        })
      });

      // Download the file using signed URL
      const link = document.createElement('a');
      link.href = signedUrl;
        link.download = `${product.title}.${getFileExtension(product.file_url)}`;
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err: any) {
      console.error('Download failed:', err);
      alert('Download failed: ' + (err.message || 'Please try again.'));
    } finally {
      setDownloading(false);
    }
  };

  const getFileExtension = (url: string): string => {
    const path = url.split('/').pop() || '';
    const extension = path.split('.').pop() || '';
    return extension || 'file';
  };

  const copyTxHash = () => {
    if (access?.txHash) {
      navigator.clipboard.writeText(access.txHash);
      alert('Transaction hash copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-background-light text-tertiary dark:bg-background-dark dark:text-white flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.12),transparent_45%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,24,40,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,24,40,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tertiary/60 dark:text-gray-300">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-background-light text-tertiary dark:bg-background-dark dark:text-white flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.12),transparent_45%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,24,40,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,24,40,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
        </div>
        <div className="max-w-md w-full bg-white/90 dark:bg-[#121212]/80 backdrop-blur-xl border border-accent-3/30 dark:border-white/10 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-tertiary dark:text-white mb-2">Access Denied</h1>
          <p className="text-tertiary/50 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-secondary hover:bg-secondary/90 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!access || !product) {
    return (
      <div className="min-h-screen bg-background-light text-tertiary dark:bg-background-dark dark:text-white flex items-center justify-center">
        <div className="text-center">
          <p className="opacity-70 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  const isExpired = new Date() > new Date(access.expiresAt);
  const timeLeft = new Date(access.expiresAt).getTime() - new Date().getTime();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  return (
    <div className="relative min-h-screen bg-background-light text-tertiary dark:bg-background-dark dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.12),transparent_45%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,24,40,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,24,40,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
      </div>
      {/* Header */}
      <div className="bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-b border-[#C9A0FF]/30 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1F1F1F] dark:text-white mb-2">Payment Successful!</h1>
            <p className="opacity-70 dark:text-gray-300">Your file is ready for download</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[#C9A0FF]/30 dark:border-white/10 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-[#333333] mb-4">Product Details</h2>
              
              {product.image_url && (
                <div className="mb-4">
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <h3 className="text-lg font-semibold text-[#333333] mb-2">{product.title}</h3>
              <p className="opacity-70 mb-4">{product.description}</p>
              
              <div className="flex items-center justify-between text-sm opacity-70">
                <span>Price: {product.price_amount} {product.price_token}</span>
                <span>Downloads: {access.downloadCount}</span>
              </div>
            </div>

            {/* Access Info */}
            <div className="bg-white/80 backdrop-blur-xl border border-[#C9A0FF]/30 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-[#333333] mb-4">Access Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-70">Your Wallet:</span>
                  <span className="text-sm font-mono text-[#333333]">
                    {access.buyerWallet.slice(0, 6)}...{access.buyerWallet.slice(-4)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-70">Transaction:</span>
                  <button
                    onClick={copyTxHash}
                    className="text-sm font-mono text-[#FF6F61] hover:underline flex items-center gap-1"
                  >
                    {access.txHash.slice(0, 10)}...
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-70">Access Expires:</span>
                  <span className={`text-sm ${isExpired ? 'text-primary' : 'text-[#333333]'}`}>
                    {isExpired ? 'Expired' : `${hoursLeft}h remaining`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl border border-[#C9A0FF]/30 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-[#1F1F1F] dark:text-white mb-4">Download Your File</h2>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-[#FFF685]/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <File className="w-10 h-10 text-[#C9A0FF]" />
                </div>
                
                <h3 className="text-lg font-semibold text-[#1F1F1F] dark:text-white mb-2">{product.title}</h3>
                <p className="opacity-70 dark:text-gray-300 mb-6">Click below to download your file</p>

                {isExpired ? (
                  <div className="p-4 bg-red-50 rounded-lg mb-6">
                    <p className="text-red-800 text-sm">
                      Your access has expired. Please contact support if you need assistance.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full bg-[#FF5A76] hover:opacity-90 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download File
                      </>
                    )}
                  </button>
                )}

                <div className="mt-4 p-4 bg-[#54F3C0]/30 rounded-lg">
                  <p className="text-sm">
                    <strong>Note:</strong> This download link will expire in {hoursLeft} hours. 
                    Make sure to download your file before then.
                  </p>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[#C9A0FF]/30 dark:border-white/10 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-[#1F1F1F] dark:text-white mb-4">Need Help?</h3>
              <p className="text-sm opacity-70 dark:text-gray-300 mb-4">
                If you're having trouble downloading your file, please contact support with your transaction hash.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="text-[#FF5A76] text-sm font-medium hover:underline"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

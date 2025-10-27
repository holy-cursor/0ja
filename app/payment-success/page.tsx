'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Download, 
  ArrowRight, 
  ExternalLink,
  Copy,
  Check,
  Clock,
  Shield
} from "lucide-react";

interface PaymentData {
  productName: string;
  productDescription: string;
  price: number;
  token: string;
  transactionHash: string;
  downloadUrl?: string;
  accessExpires?: string;
  copiesRemaining?: number;
}

export default function PaymentSuccessPage() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // In a real app, this would come from URL params or API call
    // For now, we'll use mock data
    setPaymentData({
      productName: "Complete Crypto Trading Guide",
      productDescription: "A comprehensive guide covering everything from basics to advanced trading strategies.",
      price: 25.00,
      token: "USDC",
      transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
      downloadUrl: "/api/files/download/example-file.pdf",
      accessExpires: "2024-12-31T23:59:59Z",
      copiesRemaining: 47
    });
  }, []);

  const copyTransactionHash = () => {
    if (paymentData?.transactionHash) {
      navigator.clipboard.writeText(paymentData.transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!paymentData?.downloadUrl) return;
    
    setDownloading(true);
    try {
      // In a real app, this would trigger the actual download
      const response = await fetch(paymentData.downloadUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${paymentData.productName}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!paymentData) {
    return (
      <div className="relative min-h-screen bg-background-light text-tertiary dark:bg-background-dark dark:text-white flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.12),transparent_45%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,24,40,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,24,40,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tertiary/70 dark:text-gray-300">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background-light text-tertiary dark:bg-background-dark dark:text-white py-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.12),transparent_45%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,24,40,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,24,40,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-accent-2/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-accent-2" />
          </div>
          <h1 className="text-3xl font-bold text-tertiary dark:text-white mb-2">Payment Successful!</h1>
          <p className="text-tertiary/70 dark:text-gray-300">
            Your payment has been processed and you now have access to your purchase.
          </p>
        </div>

        {/* Product Details */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-accent-3/30 dark:border-white/10 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-tertiary dark:text-white mb-2">{paymentData.productName}</h2>
          <p className="text-tertiary/70 dark:text-gray-300 mb-4">{paymentData.productDescription}</p>
          
          <div className="flex items-center justify-between py-4 border-t border-white/60">
            <div>
              <p className="text-sm text-tertiary/70 dark:text-gray-300">Amount Paid</p>
              <p className="text-lg font-semibold text-tertiary dark:text-white">
                {paymentData.price} {paymentData.token}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-tertiary/70 dark:text-gray-300">Transaction</p>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm text-tertiary dark:text-white">
                  {paymentData.transactionHash.slice(0, 8)}...{paymentData.transactionHash.slice(-8)}
                </span>
                <button
                  onClick={copyTransactionHash}
                  className="p-1 text-tertiary dark:text-white hover:opacity-90"
                >
                  {copied ? <Check className="w-4 h-4 text-accent-2" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Access Information */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-accent-3/30 dark:border-white/10 rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-tertiary dark:text-white mb-4">Access Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-[#C9A0FF]" />
              <div>
                <p className="font-medium text-tertiary dark:text-white">Access Granted</p>
                <p className="text-sm text-tertiary/70 dark:text-gray-300">You can now download and access your purchase</p>
              </div>
            </div>
            
            {paymentData.accessExpires && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-[#C9A0FF]" />
                <div>
                  <p className="font-medium text-tertiary dark:text-white">Access Expires</p>
                  <p className="text-sm text-tertiary/70 dark:text-gray-300">{formatDate(paymentData.accessExpires)}</p>
                </div>
              </div>
            )}
            
            {paymentData.copiesRemaining !== undefined && (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600">!</span>
                </div>
                <div>
                <p className="font-medium text-tertiary dark:text-white">Limited Edition</p>
                <p className="text-sm text-tertiary/70 dark:text-gray-300">
                    Only {paymentData.copiesRemaining} copies remaining
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-accent-3/30 dark:border-white/10 rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-tertiary dark:text-white mb-4">Download Your Product</h3>
          
          {paymentData.downloadUrl ? (
            <div className="space-y-4">
              <p className="text-tertiary/70 dark:text-gray-300">
                Click the button below to download your product. You can download it multiple times 
                until your access expires.
              </p>
              
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-[#FF5A76] hover:opacity-90 text-white py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Product
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-tertiary dark:text-white mb-2">External Access</h4>
              <p className="text-tertiary/70 dark:text-gray-300 mb-4">
                This product provides external access. Check your email for access instructions.
              </p>
              <button className="bg-[#FF5A76] hover:opacity-90 text-white py-2 px-4 rounded-lg transition">
                Check Email
              </button>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-[#54F3C0]/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-tertiary dark:text-white mb-4">What's Next?</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#3EA8FF] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-tertiary dark:text-white">Download your product</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Access your purchase immediately after payment</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#3EA8FF] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-tertiary dark:text-white">Explore more products</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Discover other amazing digital products from our creators</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#3EA8FF] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-tertiary dark:text-white">Follow the creator</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Stay updated with new releases from this creator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/explore"
            className="w-full bg-[#FF5A76] hover:opacity-90 text-white py-3 px-4 rounded-lg transition flex items-center justify-center"
          >
            Explore More Products
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard"
              className="border border-accent-3/30 dark:border-white/10 bg-white/70 dark:bg-white/5 text-tertiary dark:text-white py-3 px-4 rounded-lg hover:bg-white dark:hover:bg-white/10 transition text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="border border-accent-3/30 dark:border-white/10 bg-white/70 dark:bg-white/5 text-tertiary dark:text-white py-3 px-4 rounded-lg hover:bg-white dark:hover:bg-white/10 transition text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-tertiary/70 dark:text-gray-300">
            Need help? Contact our{' '}
            <a href="/support" className="text-[#FF5A76] hover:opacity-90">
              support team
            </a>{' '}
            or check our{' '}
            <a href="/help" className="text-[#FF5A76] hover:opacity-90">
              help center
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

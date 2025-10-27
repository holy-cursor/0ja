'use client';

import { useState, useEffect, use } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PaymentContract } from '../../../../lib/contract';
import { checkUSDCBalanceDirectly } from '../../../../lib/usdc-test';
import { ethers } from 'ethers';
import { 
  Download, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Copy,
  ArrowLeft,
  DollarSign,
  Clock,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string;
  price_amount: number;
  price_token: string;
  file_url: string;
  success_redirect: string;
  image_url: string;
  creator_wallet: string;
  slug: string;
  created_at: string;
}

interface PaymentStatus {
  status: 'idle' | 'pending' | 'success' | 'failed';
  txHash?: string;
  error?: string;
}

export default function PaymentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<string>('0');
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [testingBalance, setTestingBalance] = useState(false);

  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (isConnected && address && product) {
      loadContractData();
    }
  }, [isConnected, address, product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${slug}`);
      
      if (!response.ok) {
        throw new Error('Product not found');
      }
      
      const data = await response.json();
      
      if (data.success && data.product) {
        setProduct(data.product);
      } else {
        throw new Error('Invalid product data');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Product not found or invalid link');
    } finally {
      setLoading(false);
    }
  };

  const loadContractData = async () => {
    if (!window.ethereum || !address || !product) return;

    try {
      console.log('Loading contract data for:', { address, productId: product.id });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const paymentContract = new PaymentContract(signer);

      // Load contract info (with fallback)
      console.log('Loading contract info...');
      const info = await paymentContract.getContractInfo();
      setContractInfo(info);

      // Load USDC balance
      console.log('Loading USDC balance...');
      const balance = await paymentContract.getUSDCBalance();
      console.log('Loaded USDC balance:', balance);
      setUsdtBalance(balance);

      // Check if we need approval
      console.log('Checking USDC allowance...');
      const allowance = await paymentContract.getUSDCAllowance();
      const requiredAmount = product.price_amount.toString();
      const needsApprovalValue = parseFloat(allowance) < parseFloat(requiredAmount);
      console.log('Needs approval:', needsApprovalValue, { allowance, requiredAmount });
      setNeedsApproval(needsApprovalValue);

    } catch (error) {
      console.error('Error loading contract data:', error);
      // Set default values so the UI still works
      setUsdtBalance('0');
      setNeedsApproval(true);
      setContractInfo({
        platformFeeBps: "200",
        platformFeePercent: "2.00",
        platformReceiver: "0x0000000000000000000000000000000000000000",
        usdcToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
      });
    }
  };

  const testUSDCBalance = async () => {
    if (!address) return;
    
    setTestingBalance(true);
    try {
      const result = await checkUSDCBalanceDirectly(address);
      console.log('Direct USDC balance check result:', result);
      alert(`USDC Balance: ${result.formatted} USDC`);
    } catch (error) {
      console.error('Error testing USDC balance:', error);
      alert('Error checking USDC balance: ' + (error as Error).message);
    } finally {
      setTestingBalance(false);
    }
  };

  const handlePayment = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!product) return;

    setIsProcessing(true);
    setPaymentStatus({ status: 'pending' });

    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const paymentContract = new PaymentContract(signer);

      console.log('Processing payment for:', product.title);
      console.log('Amount:', product.price_amount, product.price_token);
      console.log('Buyer wallet:', address);
      console.log('Creator wallet:', product.creator_wallet);

      // Check USDC balance
      console.log('Checking USDC balance...');
      console.log('Current balance:', usdtBalance);
      console.log('Required amount:', product.price_amount);
      
      const balance = parseFloat(usdtBalance);
      if (balance < product.price_amount) {
        console.error('Insufficient balance:', { balance, required: product.price_amount });
        throw new Error(`Insufficient USDC balance. You have ${usdtBalance} USDC but need ${product.price_amount} USDC`);
      }

      // Approve USDC if needed
      if (needsApproval) {
        console.log('Approving USDC...');
        const approveTx = await paymentContract.approveUSDC(product.price_amount.toString());
        await approveTx.wait();
        console.log('USDC approved');
        setNeedsApproval(false);
      }

      // Execute payment
      console.log('Executing payment...');
      const tx = await paymentContract.payWithUSDC(
        product.id,
        product.creator_wallet,
        product.price_amount.toString()
      );

      console.log('Transaction sent:', tx.hash);
      setPaymentStatus({
        status: 'pending',
        txHash: tx.hash
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Update payment status
      setPaymentStatus({
        status: 'success',
        txHash: tx.hash
      });

      // Record payment in database
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          buyer_wallet: address,
          amount: product.price_amount,
          token: product.price_token,
          tx_hash: tx.hash,
        }),
      });

      // Grant file access
      try {
        console.log('Granting file access for product:', product.id);
        console.log('Buyer wallet:', address);
        console.log('Transaction hash:', tx.hash);
        
        const accessResponse = await fetch('/api/files/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            productSlug: product.slug,
            buyerWallet: address,
            txHash: tx.hash,
          }),
        });

        console.log('File access response status:', accessResponse.status);
        
        if (accessResponse.ok) {
          const accessData = await accessResponse.json();
          console.log('File access response data:', accessData);
          
          if (accessData.success) {
            console.log('Redirecting to download page:', `/download/${accessData.accessToken}`);
            // Redirect to download page
            window.location.href = `/download/${accessData.accessToken}`;
            return;
          } else {
            console.error('File access failed:', accessData.error);
          }
        } else {
          const errorText = await accessResponse.text();
          console.error('File access API error:', accessResponse.status, errorText);
        }
      } catch (accessError) {
        console.error('File access request failed:', accessError);
      }

      // Refresh contract data
      await loadContractData();

    } catch (err: any) {
      console.error('Payment error:', err);
      setPaymentStatus({ 
        status: 'failed', 
        error: err.message || 'Payment failed. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] dark:bg-[#121212] text-[#1F1F1F] dark:text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#3EA8FF] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] dark:bg-[#121212] text-[#1F1F1F] dark:text-white flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-white/5 rounded-2xl shadow-sm p-8 text-center border border-white/60 dark:border-white/10">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h1>
          <p className="text-gray-500 dark:text-gray-300 mb-6">
            This product link is invalid or the product has been removed.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#FF5A76] text-white rounded-lg hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (paymentStatus.status === 'success') {
    return (
      <div className="min-h-screen bg-[#FFF9F4] dark:bg-[#121212] text-[#1F1F1F] dark:text-white flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white dark:bg-white/5 rounded-2xl shadow-sm p-8 border border-white/60 dark:border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-500 dark:text-gray-300">Your payment has been confirmed</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Product:</span> {product.title}</div>
                <div><span className="font-medium">Amount:</span> {product.price_amount} {product.price_token}</div>
                <div><span className="font-medium">Transaction:</span> 
                  <span className="font-mono text-xs ml-2">{paymentStatus.txHash}</span>
                  <button
                    onClick={() => copyToClipboard(paymentStatus.txHash || '')}
                    className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-white/5 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 dark:text-white mb-2">Download Your File</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={product.file_url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-transparent border border-blue-200 dark:border-white/20 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(product.file_url)}
                  className="px-4 py-2 bg-[#3EA8FF] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                  Copy Link
                </button>
                <a
                  href={product.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </a>
              </div>
              <p className="text-xs text-blue-700 dark:text-gray-300 mt-2">
                Click download to access your purchased file
              </p>
            </div>

            {product.success_redirect && (
              <div className="text-center">
                <a
                  href={product.success_redirect}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-[#FF5A76] text-white rounded-lg hover:opacity-90 transition"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Continue to {new URL(product.success_redirect).hostname}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <div className="bg-white/90 dark:bg-background-dark/80 backdrop-blur border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">0ja</h1>
                <p className="text-gray-900/70 dark:text-gray-300">Secure crypto payments</p>
              </div>
            </div>
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-900/60 dark:text-gray-300">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="text-gray-900/50 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-white/10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{product.title}</h2>
              
              {product.image_url && (
                <div className="mb-6">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-4">
                <p className="text-gray-900/60 dark:text-gray-300 leading-relaxed">{product.description}</p>
                
                <div className="flex items-center space-x-2 text-sm text-gray-900/50">
                  <Clock className="w-4 h-4" />
                  <span>Created {new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-white/10">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Security Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-900/80 dark:text-gray-300">On-chain payment verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-900/80 dark:text-gray-300">No chargebacks or disputes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-900/80 dark:text-gray-300">Instant file delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Complete Your Purchase</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-900/80 dark:text-gray-300">Product Price</span>
                  <span className="font-semibold">{product.price_amount} {product.price_token}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-900/80 dark:text-gray-300">Platform Fee (2%)</span>
                  <span className="font-semibold">{(product.price_amount * 0.02).toFixed(2)} {product.price_token}</span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{product.price_amount} {product.price_token}</span>
                </div>
              </div>

              {/* USDC Balance and Contract Info */}
              {isConnected && contractInfo && (
                <div className="mt-4 p-4 bg-white dark:bg-white/5 border border-[#C9A0FF]/30 dark:border-white/10 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#1F1F1F] dark:text-gray-300 opacity-80">Your USDC Balance:</span>
                      <div className="font-semibold text-[#1F1F1F] dark:text-white">{usdtBalance} USDC</div>
                    </div>
                    <div>
                      <span className="text-[#1F1F1F] dark:text-gray-300 opacity-80">Platform Fee:</span>
                      <div className="font-semibold">{contractInfo.platformFeePercent}%</div>
                    </div>
                  </div>
                  {needsApproval && (
                    <div className="mt-2 p-2 bg-[#FFE666]/60 border border-[#FFE666] rounded text-sm text-[#1F1F1F] dark:text-white">
                      ⚠️ You need to approve USDC spending first
                    </div>
                  )}
                  <div className="mt-2">
                    <button
                      onClick={testUSDCBalance}
                      disabled={testingBalance}
                      className="px-3 py-1 bg-[#3EA8FF]/20 hover:bg-[#3EA8FF]/30 text-[#1F1F1F] dark:text-white text-xs rounded disabled:opacity-50"
                    >
                      {testingBalance ? 'Testing...' : 'Test USDC Balance'}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6">
                {!isConnected ? (
                  <div className="text-center">
                    <p className="text-gray-900/70 dark:text-gray-300 mb-4">Connect your wallet to continue</p>
                    <ConnectButton />
                  </div>
                ) : (
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-coral hover:bg-coral/90 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : needsApproval ? (
                      <>
                        <Shield className="w-5 h-5" />
                        Approve USDC First
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5" />
                        Pay {product.price_amount} USDC
                      </>
                    )}
                  </button>
                )}
              </div>

              {paymentStatus.status === 'failed' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-red-800">{paymentStatus.error}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-green-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-900">
                <strong>Note:</strong> This is a demo payment. In production, this would process real USDC payments on Base network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

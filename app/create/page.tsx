'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { 
  Upload, 
  File, 
  DollarSign, 
  Tag, 
  Image as ImageIcon,
  Link as LinkIcon,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Package,
  Wallet
} from "lucide-react";
import Link from "next/link";

interface ProductForm {
  title: string;
  description: string;
  price_amount: string;
  price_token: string;
  category: string;
  tags: string[];
  cover_image: File | null;
  file_upload: File | null;
  external_url: string;
  delivery_method: string;
  product_type: string;
  access_duration: string;
  copy_limit: string;
  copy_limit_type: 'unlimited' | 'limited';
}

const categories = [
  'eBooks', 'Courses', 'Templates', 'Art', 'Audio', 'Software', 'Services', 'Other'
];

const deliveryMethods = [
  { value: 'download', label: 'Direct Download' },
  { value: 'external', label: 'External Access' }
];

const productTypes = [
  { value: 'one-time', label: 'One-time Payment' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'free', label: 'Free (Lead Magnet)' }
];

export default function CreateProduct() {
  const { isLoaded, user } = useUser();
  const [formData, setFormData] = useState<ProductForm>({
    title: '',
    description: '',
    price_amount: '',
    price_token: 'USDC',
    category: '',
    tags: [],
    cover_image: null,
    file_upload: null,
    external_url: '',
    delivery_method: 'download',
    product_type: 'one-time',
    access_duration: 'lifetime',
    copy_limit: '',
    copy_limit_type: 'unlimited'
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTutorial, setShowTutorial] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProductLink, setCreatedProductLink] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Check wallet connection on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          setIsWalletConnected(accounts.length > 0);
          setWalletAddress(accounts[0] || '');
        } catch (error) {
          console.error('Error checking wallet:', error);
        }
      }
    };
    checkWalletConnection();
    // Coerce any legacy 'stream' selection to 'download'
    setFormData(prev => ({
      ...prev,
      delivery_method: prev.delivery_method === 'stream' ? 'download' : prev.delivery_method
    }));
  }, []);

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
            <h1 className="text-2xl font-bold mb-4">Please sign in to create products</h1>
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

  // Show wallet modal if trying to submit without wallet connected
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWalletConnected) {
      setShowWalletModal(true);
      return;
    }
    
    // Continue with form submission...
  };

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (field: 'cover_image' | 'file_upload', file: File) => {
    handleInputChange(field, file);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.product_type !== 'free' && !formData.price_amount) {
      newErrors.price_amount = 'Price is required for paid products';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.delivery_method === 'download' && !formData.file_upload) {
      newErrors.file_upload = 'File upload is required for direct download';
    }

    if (formData.delivery_method === 'external' && !formData.external_url) {
      newErrors.external_url = 'External URL is required for external access';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if wallet is connected before submitting
    if (!isWalletConnected) {
      setShowWalletModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Helper to upload a single file and return its URL
      const uploadFileAndGetUrl = async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/files/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('File upload failed');
        const data = await res.json();
        return data?.file?.url || '';
      };

      // Ensure we have the current wallet address
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts[0]) setWalletAddress(accounts[0]);
        } catch {}
      }

      // Resolve media URLs
      let imageUrl = '';
      if (formData.cover_image) {
        imageUrl = await uploadFileAndGetUrl(formData.cover_image);
      }

      let fileUrl = '';
      if (formData.delivery_method === 'external') {
        fileUrl = formData.external_url || '';
      } else if (formData.delivery_method === 'download' && formData.file_upload) {
        fileUrl = await uploadFileAndGetUrl(formData.file_upload);
      }

      // Build JSON payload expected by API
      const payload = {
        creator_wallet: walletAddress,
        title: formData.title,
        description: formData.description,
        price_amount: parseFloat(formData.price_amount || '0'),
        price_token: formData.price_token,
        file_url: fileUrl,
        success_redirect: '',
        image_url: imageUrl,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result?.success && result?.product?.slug) {
        const productLink = `${window.location.origin}/p/${result.product.slug}`;
        setCreatedProductLink(productLink);
        setShowSuccessModal(true);
      } else {
        console.error('Failed to create product:', result?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white py-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,90,118,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(201,160,255,0.12),transparent_45%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(31,31,31,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,31,31,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Product</h1>
            <p className="text-gray-900/70 dark:text-gray-300 mt-1">Upload your digital product and start earning</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coral focus:outline-none ${
                    errors.title ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Enter your product title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coral focus:outline-none ${
                    errors.description ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Describe your product in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coral focus:outline-none ${
                      errors.category ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                    Product Type
                  </label>
                  <select
                    value={formData.product_type}
                    onChange={(e) => handleInputChange('product_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coral focus:outline-none"
                  >
                    {productTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-transparent text-[#1F1F1F] dark:text-white"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing */}
            {formData.product_type !== 'free' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Price *
                    </label>
                <div className="flex flex-col sm:flex-row">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price_amount}
                        onChange={(e) => handleInputChange('price_amount', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-transparent dark:border-white/20 ${
                          errors.price_amount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      <select
                        value={formData.price_token}
                        onChange={(e) => handleInputChange('price_token', e.target.value)}
                    className="px-3 py-2 border sm:border-l-0 border-gray-300 dark:border-white/20 rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-transparent"
                      >
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                        <option value="ETH">ETH</option>
                      </select>
                    </div>
                    {errors.price_amount && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.price_amount}
                      </p>
                    )}
                  </div>
            </div>
          </div>
        )}

        {/* Access Settings */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-[#1F1F1F] dark:text-white">Access Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1F1F1F] dark:text-gray-200 mb-2">
                Access Duration
              </label>
              <select
                value={formData.access_duration}
                onChange={(e) => handleInputChange('access_duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-transparent text-[#1F1F1F] dark:text-white"
              >
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="lifetime">Lifetime Access</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How long customers can access your product after purchase
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F1F1F] dark:text-gray-200 mb-2">
                Copy Availability
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="unlimited"
                    name="copy_limit_type"
                    value="unlimited"
                    checked={formData.copy_limit_type === 'unlimited'}
                    onChange={(e) => handleInputChange('copy_limit_type', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="unlimited" className="text-sm text-gray-700 dark:text-gray-300">
                    Unlimited copies available
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="limited"
                    name="copy_limit_type"
                    value="limited"
                    checked={formData.copy_limit_type === 'limited'}
                    onChange={(e) => handleInputChange('copy_limit_type', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="limited" className="text-sm text-gray-700 dark:text-gray-300">
                    Limited copies
                  </label>
                </div>
              </div>
              
              {formData.copy_limit_type === 'limited' && (
                <div className="mt-3">
                  <input
                    type="number"
                    min="1"
                    value={formData.copy_limit}
                    onChange={(e) => handleInputChange('copy_limit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-transparent text-[#1F1F1F] dark:text-white"
                    placeholder="Enter number of copies"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum number of copies available for purchase
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#1F1F1F] dark:text-white">Media</h2>
              
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F] dark:text-gray-200 mb-2">
                  Cover Image
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg p-6 text-center bg-white dark:bg-transparent">
                  {formData.cover_image ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formData.cover_image.name}</p>
                      <button
                        type="button"
                        onClick={() => handleInputChange('cover_image', null)}
                        className="text-sm text-red-600 hover:text-red-800 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('cover_image', e.target.files[0])}
                        className="hidden"
                        id="cover-image"
                      />
                      <label
                        htmlFor="cover-image"
                        className="cursor-pointer bg-[#FF5A76] hover:opacity-90 text-white px-4 py-2 rounded-lg transition"
                      >
                        Upload Cover Image
                      </label>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#1F1F1F] dark:text-white">Delivery Method</h2>
              
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F] dark:text-gray-200 mb-2">
                  How will customers access your product?
                </label>
                <div className="space-y-3">
                  {deliveryMethods.map(method => (
                    <label key={method.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="delivery_method"
                        value={method.value}
                        checked={formData.delivery_method === method.value}
                        onChange={(e) => handleInputChange('delivery_method', e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.delivery_method === 'download' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    File Upload *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg p-6 text-center bg-white dark:bg-transparent">
                    {formData.file_upload ? (
                      <div className="space-y-2">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">{formData.file_upload.name}</p>
                        <p className="text-xs text-gray-500">{(formData.file_upload.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                          type="button"
                          onClick={() => handleInputChange('file_upload', null)}
                          className="text-sm text-red-600 hover:text-red-800 transition"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <input
                          type="file"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('file_upload', e.target.files[0])}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer bg-[#FF5A76] hover:opacity-90 text-white px-4 py-2 rounded-lg transition"
                        >
                          Upload File
                        </label>
                        <p className="text-sm text-gray-500 mt-2">Any file type up to 100MB</p>
                      </>
                    )}
                  </div>
                  {errors.file_upload && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.file_upload}
                    </p>
                  )}
                </div>
              )}

              {formData.delivery_method === 'external' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    External URL *
                  </label>
                  <div className="flex">
                    <LinkIcon className="w-5 h-5 text-gray-400 mt-2 mr-2" />
                    <input
                      type="url"
                      value={formData.external_url}
                      onChange={(e) => handleInputChange('external_url', e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        errors.external_url ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://example.com/your-product"
                    />
                  </div>
                  {errors.external_url && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.external_url}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-[#C9A0FF]/30 dark:border-white/10">
              <button
                type="button"
                className="px-6 py-2 border border-white/60 bg-white/70 text-gray-800 rounded-lg hover:bg-white transition"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#FF5A76] hover:opacity-90 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#FFF685]/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <File className="w-8 h-8 text-[#C9A0FF]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1F1F1F] dark:text-white mb-2">Create Your First Product</h3>
              <p className="text-[#1F1F1F] dark:text-gray-300 opacity-70">
                Follow these simple steps to create and sell your digital product
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#3EA8FF] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-[#1F1F1F] dark:text-white">Basic Information</h4>
                  <p className="text-sm text-[#1F1F1F] dark:text-gray-300 opacity-70">Add a compelling title, description, and choose the right category for your product.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#3EA8FF] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-[#1F1F1F] dark:text-white">Set Your Price</h4>
                  <p className="text-sm text-[#1F1F1F] dark:text-gray-300 opacity-70">Choose your pricing strategy - one-time payment, subscription, or free lead magnet.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#3EA8FF] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-[#1F1F1F] dark:text-white">Upload Content</h4>
                  <p className="text-sm text-[#1F1F1F] dark:text-gray-300 opacity-70">Upload your product file or provide an external link for customers to access.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#3EA8FF] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                <div>
                  <h4 className="font-semibold text-[#1F1F1F] dark:text-white">Configure Access</h4>
                  <p className="text-sm text-[#1F1F1F] dark:text-gray-300 opacity-70">Set how long customers can access your product and any copy limits.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowTutorial(false)}
                className="px-6 py-2 border border-white/60 bg-white/70 text-gray-800 rounded-lg hover:bg-white transition"
              >
                Skip Tutorial
              </button>
              <button
                onClick={() => setShowTutorial(false)}
                className="px-6 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition"
              >
                Let's Start!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-[#1F1F1F] dark:text-white mb-2">Product Created Successfully!</h3>
            <p className="text-[#1F1F1F] dark:text-gray-300 opacity-70 mb-6">
              Your product is now live and ready for customers to purchase.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-[#1F1F1F] dark:text-gray-300 opacity-70 mb-2">Product Link:</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={createdProductLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(createdProductLink)}
                  className="px-3 py-2 bg-[#FF5A76] hover:opacity-90 text-white rounded text-sm transition"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="w-full bg-[#FF5A76] hover:opacity-90 text-white py-3 rounded-lg transition flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full border border-white/60 bg-white/70 text-gray-800 py-3 rounded-lg hover:bg-white transition"
              >
                Create Another Product
              </button>
            </div>
          </div>
        </div>
      )}

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
                  You need to connect your wallet before creating a product to receive payments.
                </p>

                {/* Features */}
                <div className="space-y-2 mb-8">
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
                      try {
                        if (typeof window !== 'undefined' && (window as any).ethereum) {
                          await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                          setIsWalletConnected(true);
                          setShowWalletModal(false);
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
    </div>
  );
}
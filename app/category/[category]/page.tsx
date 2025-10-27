'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { 
  Star, 
  File,
  DollarSign,
  Search,
  Filter,
  Grid,
  List,
  ArrowRight,
  Users,
  TrendingUp
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  price_amount: number;
  price_token: string;
  image_url?: string;
  slug: string;
  creator_name: string;
  creator_username: string;
  creator_avatar?: string;
  category: string;
  rating?: number;
  sales_count?: number;
  created_at: string;
}

interface Category {
  name: string;
  slug: string;
  description: string;
  product_count: number;
  icon: string;
}

const categories: Category[] = [
  { name: 'eBooks', slug: 'ebooks', description: 'Digital books and guides', product_count: 1247, icon: '📚' },
  { name: 'Courses', slug: 'courses', description: 'Online courses and tutorials', product_count: 892, icon: '🎓' },
  { name: 'Templates', slug: 'templates', description: 'Design templates and themes', product_count: 2156, icon: '🎨' },
  { name: 'Art', slug: 'art', description: 'Digital art and illustrations', product_count: 1834, icon: '🖼️' },
  { name: 'Audio', slug: 'audio', description: 'Music, sounds, and podcasts', product_count: 567, icon: '🎵' },
  { name: 'Software', slug: 'software', description: 'Apps, tools, and software', product_count: 423, icon: '💻' },
  { name: 'Services', slug: 'services', description: 'Digital services and consultations', product_count: 298, icon: '🔧' },
  { name: 'Other', slug: 'other', description: 'Miscellaneous digital products', product_count: 156, icon: '📦' }
];

export default function CategoryPage({ params }: { params: { category: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const currentCategory = categories.find(cat => cat.slug === params.category) || categories[0];

  useEffect(() => {
    fetchProducts();
  }, [params.category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products', { cache: 'no-store' });
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
        creator_name: 'Unknown Creator',
        creator_username: 'creator',
        creator_avatar: undefined,
        category: params.category,
        rating: undefined,
        sales_count: 0,
        created_at: p.created_at ?? new Date().toISOString(),
      }));
      setProducts(apiProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.creator_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = (!priceRange.min || product.price_amount >= parseFloat(priceRange.min)) &&
                        (!priceRange.max || product.price_amount <= parseFloat(priceRange.max));
    
    return matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price_amount - b.price_amount;
      case 'price_high':
        return b.price_amount - a.price_amount;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'sales':
        return (b.sales_count || 0) - (a.sales_count || 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="relative min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,90,118,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(201,160,255,0.12),transparent_45%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(31,31,31,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,31,31,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
      </div>
      {/* Header */}
      <div className="bg-white/70 dark:bg-background-dark/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-4xl">{currentCategory.icon}</span>
            <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentCategory.name}</h1>
              <p className="text-gray-900/60 dark:text-gray-300">{currentCategory.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center space-x-6 flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-900/60 dark:text-gray-300">{currentCategory.product_count.toLocaleString()} products</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-900/60 dark:text-gray-300">Active creators</span>
              </div>
            </div>
            
            <Link
              href="/explore"
        className="text-coral hover:text-coral/90 font-medium flex items-center"
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Browse All Categories
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-transparent backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-coral focus:outline-none w-full sm:w-64 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* Price Range */}
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-20 px-3 py-2 border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-transparent backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-coral focus:outline-none text-gray-900 dark:text-white"
                />
                <span className="text-gray-900/50">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-20 px-3 py-2 border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-transparent backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-coral focus:outline-none text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 flex-wrap gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-transparent backdrop-blur-sm rounded-lg focus:ring-2 focus:ring-coral focus:outline-none text-gray-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="sales">Most Popular</option>
              </select>
              
              {/* View Mode */}
              <div className="flex border border-gray-200 dark:border-white/10 rounded-lg bg-white/60 dark:bg-white/5 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#FF5A76] hover:opacity-90 text-white' : 'text-gray-900 dark:text-white hover:bg-white/70 dark:hover:bg-white/10'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#FF5A76] hover:opacity-90 text-white' : 'text-gray-900 dark:text-white hover:bg-white/70 dark:hover:bg-white/10'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-900/60 dark:text-gray-300">Loading products...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-900/60 dark:text-gray-300 mb-6">Try adjusting your search or filter criteria.</p>
            <Link
              href="/explore"
              className="inline-flex items-center px-6 py-3 bg-[#FF5A76] text-white rounded-lg font-medium hover:opacity-90 transition"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {sortedProducts.map((product) => (
              <div key={product.id} className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm shadow-sm hover:shadow-lg transition">
                <div className="absolute inset-x-0 -top-px h-px bg-[#C9A0FF]/40"></div>
                {viewMode === 'grid' ? (
                  <div className="p-6">
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          width={400}
                          height={225}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <File className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-sm text-gray-900/60 dark:text-gray-300 line-clamp-2">{product.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <Image
                        src={product.creator_avatar || '/default-avatar.png'}
                        alt={product.creator_name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{product.creator_name}</p>
                        <p className="text-xs text-gray-900/50 dark:text-gray-600">@{product.creator_username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{product.price_amount} {product.price_token}</span>
                      </div>
                      {product.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm text-gray-900/60 dark:text-gray-300">{product.rating}</span>
                          <span className="text-xs text-gray-900/50 dark:text-gray-600">({product.sales_count})</span>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      href={`/p/${product.slug}`}
                      className="w-full bg-[#FF5A76] hover:opacity-90 text-white py-2 rounded-lg transition text-center block"
                    >
                      Buy Now
                    </Link>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex items-center space-x-6">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          width={120}
                          height={80}
                          className="w-30 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-30 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <File className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{product.title}</h3>
                        <p className="text-gray-900/60 dark:text-gray-300 mb-2">{product.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-900/50 mb-2">
                          <div className="flex items-center space-x-2">
                            <Image
                              src={product.creator_avatar || '/default-avatar.png'}
                              alt={product.creator_name}
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span>{product.creator_name}</span>
                          </div>
                          {product.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span>{product.rating}</span>
                            </div>
                          )}
                          <span>{product.sales_count} sales</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {product.price_amount} {product.price_token}
                        </div>
                        <Link
                          href={`/p/${product.slug}`}
                          className="bg-[#FF5A76] hover:opacity-90 text-white px-6 py-2 rounded-lg transition"
                        >
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

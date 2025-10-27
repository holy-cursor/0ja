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
      // Mock product data for the category
      const mockProducts: Product[] = [
        {
          id: '1',
          title: 'Complete Web Development Guide',
          description: 'Learn full-stack development from scratch with this comprehensive guide.',
          price_amount: 49.99,
          price_token: 'USDC',
          image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
          slug: 'complete-web-development-guide',
          creator_name: 'Sarah Chen',
          creator_username: 'sarah_dev',
          creator_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          category: params.category,
          rating: 4.8,
          sales_count: 127,
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Advanced React Patterns',
          description: 'Master advanced React patterns and best practices for scalable applications.',
          price_amount: 29.99,
          price_token: 'USDC',
          image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
          slug: 'advanced-react-patterns',
          creator_name: 'Mike Johnson',
          creator_username: 'mike_react',
          creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          category: params.category,
          rating: 4.9,
          sales_count: 89,
          created_at: '2024-01-10T14:20:00Z'
        },
        {
          id: '3',
          title: 'JavaScript Mastery Course',
          description: 'From beginner to expert in JavaScript programming language.',
          price_amount: 79.99,
          price_token: 'USDC',
          image_url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=300&fit=crop',
          slug: 'javascript-mastery-course',
          creator_name: 'Alex Rodriguez',
          creator_username: 'alex_js',
          creator_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          category: params.category,
          rating: 4.7,
          sales_count: 203,
          created_at: '2024-01-08T16:45:00Z'
        },
        {
          id: '4',
          title: 'Node.js Backend Development',
          description: 'Build robust backend applications with Node.js and Express.',
          price_amount: 59.99,
          price_token: 'USDC',
          image_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
          slug: 'nodejs-backend-development',
          creator_name: 'Emma Wilson',
          creator_username: 'emma_node',
          creator_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          category: params.category,
          rating: 4.6,
          sales_count: 156,
          created_at: '2024-01-05T09:15:00Z'
        },
        {
          id: '5',
          title: 'Python Data Science Bootcamp',
          description: 'Complete data science course using Python and popular libraries.',
          price_amount: 99.99,
          price_token: 'USDC',
          image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
          slug: 'python-data-science-bootcamp',
          creator_name: 'David Kim',
          creator_username: 'david_python',
          creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          category: params.category,
          rating: 4.9,
          sales_count: 312,
          created_at: '2024-01-03T11:30:00Z'
        },
        {
          id: '6',
          title: 'UI/UX Design Fundamentals',
          description: 'Learn the principles of user interface and user experience design.',
          price_amount: 39.99,
          price_token: 'USDC',
          image_url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
          slug: 'ui-ux-design-fundamentals',
          creator_name: 'Lisa Park',
          creator_username: 'lisa_design',
          creator_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          category: params.category,
          rating: 4.8,
          sales_count: 178,
          created_at: '2024-01-01T08:00:00Z'
        }
      ];

      setProducts(mockProducts);
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

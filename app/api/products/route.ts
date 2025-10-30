import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

// Cache products for 5 minutes
let productsCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Generate a unique slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50) + '-' + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    console.log('API POST request received');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { creator_wallet, title, description, price_amount, price_token, file_url, success_redirect, image_url } = body;
    
    // Validate required fields
    if (!creator_wallet || !title || !price_amount || !file_url) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const slug = generateSlug(title);
    console.log('Generated slug:', slug);
    
    // First, ensure creator exists in database
    const { data: creator, error: creatorError } = await supabaseAdmin
      .from('creators')
      .upsert({
        wallet_address: creator_wallet,
        email: null, // Will be updated when user signs in
      }, {
        onConflict: 'wallet_address'
      })
      .select()
      .single();

    if (creatorError) {
      console.error('Creator upsert error:', creatorError);
      return NextResponse.json(
        { error: 'Failed to create/update creator' },
        { status: 500 }
      );
    }

    // Create new product in Supabase
    const { data: newProduct, error: productError } = await supabaseAdmin
      .from('products')
      .insert({
        creator_wallet,
        slug,
        title,
        description: description || '',
        price_amount: parseFloat(price_amount),
        price_token: price_token || 'USDC',
        file_url,
        success_redirect: success_redirect || '',
        image_url: image_url || '',
        paused: false,
      })
      .select()
      .single();

    if (productError) {
      console.error('Product creation error:', productError);
      return NextResponse.json(
        { error: 'Failed to create product', details: productError.message },
        { status: 500 }
      );
    }

    const pay_link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${slug}`;

    console.log('Product created and stored:', newProduct.id);

    // Clear cache
    productsCache = null;

    return NextResponse.json({
      success: true,
      product: {
        ...newProduct,
        pay_link,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('API GET request received');
    
    // Check for cache clear parameter and creator wallet filter
    const { searchParams } = new URL(request.url);
    const clearCache = searchParams.get('clear') === 'true';
    const creatorWallet = searchParams.get('creator_wallet');
    
    // If filtering by creator wallet, don't use cache
    const shouldUseCache = !creatorWallet && !clearCache && productsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION;
    
    if (shouldUseCache) {
      console.log('Returning cached products');
      return NextResponse.json({ products: productsCache });
    }
    
    // Build query with optional creator wallet filter
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .eq('paused', false);
    
    if (creatorWallet) {
      query = query.eq('creator_wallet', creatorWallet);
      console.log('Filtering products by creator_wallet:', creatorWallet);
    }
    
    // Fetch products from Supabase
    const { data: allProducts, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // If filtering by creator wallet, fetch payment data and calculate sales stats
    let productsWithSales = allProducts || [];
    if (creatorWallet && allProducts && allProducts.length > 0) {
      const productIds = allProducts.map(p => p.id);
      
      // Fetch all payments for these products
      const { data: payments, error: paymentsError } = await supabaseAdmin
        .from('payments')
        .select('product_id, creator_amount')
        .in('product_id', productIds);
      
      if (!paymentsError && payments) {
        // Calculate sales_count and revenue per product
        const salesMap = payments.reduce((acc, payment) => {
          const productId = payment.product_id;
          if (!acc[productId]) {
            acc[productId] = { sales_count: 0, revenue: 0 };
          }
          acc[productId].sales_count += 1;
          acc[productId].revenue += parseFloat(payment.creator_amount || 0);
          return acc;
        }, {} as Record<string, { sales_count: number; revenue: number }>);
        
        // Add sales data to products
        productsWithSales = allProducts.map(product => ({
          ...product,
          sales_count: salesMap[product.id]?.sales_count || 0,
          revenue: salesMap[product.id]?.revenue || 0,
        }));
      }
    }

    console.log('Returning', productsWithSales?.length || 0, 'products');
    
    // Update cache only if not filtering by creator (for general product listing)
    if (!creatorWallet) {
      productsCache = allProducts || [];
      cacheTimestamp = Date.now();
    }
    
    // Return products (with sales data if creator wallet filter was used)
    const response = NextResponse.json({ products: productsWithSales });
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    response.headers.set('CDN-Cache-Control', 'public, max-age=300');
    
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

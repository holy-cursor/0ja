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
    
    // Check for cache clear parameter
    const { searchParams } = new URL(request.url);
    const clearCache = searchParams.get('clear') === 'true';
    
    // Check cache
    const now = Date.now();
    if (!clearCache && productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached products');
      return NextResponse.json({ products: productsCache });
    }
    
    // Fetch products from Supabase
    const { data: allProducts, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('paused', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    console.log('Returning', allProducts?.length || 0, 'products');
    
    // Update cache
    productsCache = allProducts || [];
    cacheTimestamp = now;
    
    // Return all products
    const response = NextResponse.json({ products: allProducts || [] });
    
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

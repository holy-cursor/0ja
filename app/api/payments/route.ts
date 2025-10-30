import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { rateLimit } from '../../../lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per minute for payment submissions
  const rateLimitResult = rateLimit(request, { maxRequests: 10, windowMs: 60 * 1000 });
  if (!rateLimitResult.success) {
    const retryAfter = (rateLimitResult as any).retryAfter ?? 60;
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        }
      }
    );
  }
  
  try {
    console.log('Payment confirmation received');
    
    const body = await request.json();
    const { product_id, buyer_wallet, amount, token, tx_hash, platform_fee, creator_amount } = body;
    
    console.log('Payment details:', {
      product_id,
      buyer_wallet,
      amount,
      token,
      tx_hash,
      platform_fee,
      creator_amount,
    });

    // Validate required fields
    if (!product_id || !buyer_wallet || !amount || !token || !tx_hash) {
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    // Calculate fees if not provided
    const calculatedPlatformFee = platform_fee || (amount * 0.02); // 2% platform fee
    const calculatedCreatorAmount = creator_amount || (amount - calculatedPlatformFee);

    // Store payment record in Supabase
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .insert({
        product_id,
        buyer_wallet,
        amount: parseFloat(amount),
        token,
        tx_hash,
        platform_fee: calculatedPlatformFee,
        creator_amount: calculatedCreatorAmount,
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Payment storage error:', error);
      return NextResponse.json(
        { error: 'Failed to store payment record' },
        { status: 500 }
      );
    }

    console.log('Payment stored successfully:', payment.id);

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      payment_id: payment.id,
    });
  } catch (error) {
    console.error('Payment API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const creatorWallet = searchParams.get('creator_wallet');

    // Build query
    let query = supabaseAdmin
      .from('payments')
      .select('*')
      .order('confirmed_at', { ascending: false });

    // Filter by product_id if provided
    if (productId) {
      query = query.eq('product_id', productId);
    }

    // If creator_wallet is provided, we need to join with products table
    if (creatorWallet && !productId) {
      // Get products for this creator first
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('creator_wallet', creatorWallet);

      if (products && products.length > 0) {
        const productIds = products.map(p => p.id);
        query = query.in('product_id', productIds);
      } else {
        // No products, return empty
        return NextResponse.json({ payments: [] });
      }
    }

    const { data: payments, error } = await query;

    if (error) {
      console.error('Payments fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ payments: payments || [] });
  } catch (error) {
    console.error('Payment API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

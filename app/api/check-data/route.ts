import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Get creator data
    const { data: creator, error: creatorError } = await supabaseAdmin
      .from('creators')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    // Get creator's products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('creator_wallet', walletAddress)
      .order('created_at', { ascending: false });

    // Get creator's payments
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        products!inner(creator_wallet)
      `)
      .eq('products.creator_wallet', walletAddress)
      .order('confirmed_at', { ascending: false });

    return NextResponse.json({
      success: true,
      creator: creator || null,
      products: products || [],
      payments: payments || [],
      errors: {
        creator: creatorError?.message,
        products: productsError?.message,
        payments: paymentsError?.message,
      }
    });
  } catch (error) {
    console.error('Check data API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


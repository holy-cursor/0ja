import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorWallet = searchParams.get('creator_wallet');
    
    if (!creatorWallet) {
      return NextResponse.json(
        { error: 'Creator wallet address required' },
        { status: 400 }
      );
    }

    // Get creator's products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('creator_wallet', creatorWallet)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Products fetch error:', productsError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Get payment analytics
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        products!inner(creator_wallet)
      `)
      .eq('products.creator_wallet', creatorWallet);

    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError);
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      );
    }

    // Calculate analytics
    const totalRevenue = payments?.reduce((sum, payment) => sum + payment.creator_amount, 0) || 0;
    const totalSales = payments?.length || 0;
    const totalProducts = products?.length || 0;

    // Get recent payments
    const recentPayments = payments?.slice(0, 10) || [];

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        totalSales,
        totalProducts,
        recentPayments,
      },
      products: products || [],
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

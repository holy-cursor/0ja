import { NextRequest, NextResponse } from 'next/server';

// Mock payment data - in production, use a database
let payments: any[] = [
  {
    id: '1',
    product_id: 'mock-1',
    buyer_wallet: '0x1234567890123456789012345678901234567890',
    amount: 25,
    token: 'USDC',
    tx_hash: '0xabc123def456789',
    confirmed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: '2',
    product_id: 'mock-1',
    buyer_wallet: '0x2345678901234567890123456789012345678901',
    amount: 25,
    token: 'USDC',
    tx_hash: '0xdef456abc789012',
    confirmed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '3',
    product_id: 'mock-2',
    buyer_wallet: '0x3456789012345678901234567890123456789012',
    amount: 50,
    token: 'USDC',
    tx_hash: '0x789012def345678',
    confirmed_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorWallet = searchParams.get('creator_wallet');

    if (!creatorWallet) {
      return NextResponse.json({ 
        error: 'Creator wallet address required' 
      }, { status: 400 });
    }

    // Filter payments by creator's products
    // In production, you'd join with products table
    const creatorPayments = payments.filter(payment => {
      // For now, return all payments as mock data
      // In production, filter by products created by this wallet
      return true;
    });

    // Calculate analytics
    const totalRevenue = creatorPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalSales = creatorPayments.length;
    const recentSales = creatorPayments.filter(payment => {
      const paymentDate = new Date(payment.confirmed_at);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return paymentDate > sevenDaysAgo;
    }).length;

    // Group by product
    const productStats = creatorPayments.reduce((acc, payment) => {
      if (!acc[payment.product_id]) {
        acc[payment.product_id] = {
          product_id: payment.product_id,
          sales: 0,
          revenue: 0
        };
      }
      acc[payment.product_id].sales += 1;
      acc[payment.product_id].revenue += payment.amount;
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        totalSales,
        recentSales,
        productStats: Object.values(productStats),
        payments: creatorPayments
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

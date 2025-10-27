import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
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

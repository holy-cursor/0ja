import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { rateLimit } from '../../../../lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting: 20 requests per minute for file access grants
  const rateLimitResult = rateLimit(request, { maxRequests: 20, windowMs: 60 * 1000 });
  if (!rateLimitResult.success) {
y    const retryAfter = (rateLimitResult as any).retryAfter ?? 60;
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
        }
      }
    );
  }
  
  try {
    const { productId, buyerWallet, txHash, productSlug } = await request.json();

    if (!productId || !buyerWallet || !txHash || !productSlug) {
      return NextResponse.json({ 
        error: 'Missing required fields: productId, buyerWallet, txHash, productSlug' 
      }, { status: 400 });
    }

    // Generate unique access token
    const accessToken = `access_${Date.now()}_${uuidv4().split('-')[0]}`;
    
    // Calculate expiration (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    // Store access record in Supabase
    const { data: accessRecord, error } = await supabaseAdmin
      .from('file_access')
      .insert({
        product_id: productId,
        product_slug: productSlug,
        buyer_wallet: buyerWallet,
        tx_hash: txHash,
        access_token: accessToken,
        expires_at: expiresAt,
        download_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('File access storage error:', error);
      return NextResponse.json({ 
        error: 'Failed to grant file access',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      accessToken: accessRecord.access_token,
      expiresAt: accessRecord.expires_at
    });

  } catch (error: any) {
    console.error('File access error:', error);
    return NextResponse.json({ 
      error: 'Failed to grant file access',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('token');

    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Access token required' 
      }, { status: 400 });
    }

    // Fetch access record from Supabase
    const { data: accessRecord, error } = await supabaseAdmin
      .from('file_access')
      .select('*')
      .eq('access_token', accessToken)
      .single();

    if (error || !accessRecord) {
      return NextResponse.json({ 
        error: 'Invalid or expired access token' 
      }, { status: 404 });
    }

    // Check if token is expired
    if (new Date() > new Date(accessRecord.expires_at)) {
      // Delete expired token
      await supabaseAdmin
        .from('file_access')
        .delete()
        .eq('access_token', accessToken);
      
      return NextResponse.json({ 
        error: 'Access token has expired' 
      }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      access: {
        productId: accessRecord.product_id,
        productSlug: accessRecord.product_slug,
        buyerWallet: accessRecord.buyer_wallet,
        txHash: accessRecord.tx_hash,
        accessToken: accessRecord.access_token,
        grantedAt: accessRecord.granted_at,
        expiresAt: accessRecord.expires_at,
        downloadCount: accessRecord.download_count
      }
    });

  } catch (error: any) {
    console.error('File access check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check file access',
      details: error.message
    }, { status: 500 });
  }
}

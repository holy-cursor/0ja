import { NextRequest, NextResponse } from 'next/server';

// Global variable to persist data across requests
declare global {
  var __fileAccess: Map<string, any> | undefined;
}

// Mock database - in production, use Supabase or your database
if (!global.__fileAccess) {
  global.__fileAccess = new Map();
}

const fileAccess = global.__fileAccess;

export async function POST(request: NextRequest) {
  try {
    const { productId, buyerWallet, txHash, productSlug } = await request.json();

    if (!productId || !buyerWallet || !txHash || !productSlug) {
      return NextResponse.json({ 
        error: 'Missing required fields: productId, buyerWallet, txHash, productSlug' 
      }, { status: 400 });
    }

    // Generate access token
    const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store access record
    const accessRecord = {
      productId,
      productSlug,
      buyerWallet,
      txHash,
      accessToken,
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      downloadCount: 0
    };

    fileAccess.set(accessToken, accessRecord);

    return NextResponse.json({
      success: true,
      accessToken,
      expiresAt: accessRecord.expiresAt
    });

  } catch (error) {
    console.error('File access error:', error);
    return NextResponse.json({ 
      error: 'Failed to grant file access' 
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

    const accessRecord = fileAccess.get(accessToken);

    if (!accessRecord) {
      return NextResponse.json({ 
        error: 'Invalid or expired access token' 
      }, { status: 404 });
    }

    // Check if token is expired
    if (new Date() > new Date(accessRecord.expiresAt)) {
      fileAccess.delete(accessToken);
      return NextResponse.json({ 
        error: 'Access token has expired' 
      }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      access: accessRecord
    });

  } catch (error) {
    console.error('File access check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check file access' 
    }, { status: 500 });
  }
}

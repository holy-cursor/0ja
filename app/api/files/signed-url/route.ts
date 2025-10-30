import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

/**
 * Generate a signed URL for downloading a file
 * Requires valid access token verification
 */
export async function POST(request: NextRequest) {
  try {
    const { filePath, accessToken, expiresIn = 3600 } = await request.json();

    if (!filePath || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: filePath, accessToken' },
        { status: 400 }
      );
    }

    // Verify access token is valid and not expired
    const { data: accessRecord, error: accessError } = await supabaseAdmin
      .from('file_access')
      .select('*')
      .eq('access_token', accessToken)
      .single();

    if (accessError || !accessRecord) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 403 }
      );
    }

    // Check if token is expired
    if (new Date() > new Date(accessRecord.expires_at)) {
      return NextResponse.json(
        { error: 'Access token has expired' },
        { status: 403 }
      );
    }

    // Verify the file path matches the product from the access token
    // Extract filename from path (remove 'product-files/' prefix if present)
    const fileName = filePath.replace(/^product-files\//, '');

    // Generate signed URL (expires in 1 hour by default)
    const { data: signedUrlData, error: signedError } = await supabaseAdmin.storage
      .from('product-files')
      .createSignedUrl(fileName, expiresIn);

    if (signedError || !signedUrlData) {
      console.error('Signed URL generation error:', signedError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: signedUrlData.signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    });

  } catch (error: any) {
    console.error('Signed URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL', details: error.message },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, productId } = await request.json();

    if (!accessToken || !productId) {
      return NextResponse.json({ 
        error: 'Missing required fields: accessToken, productId' 
      }, { status: 400 });
    }

    // Fetch access record from Supabase
    const { data: accessRecord, error: fetchError } = await supabaseAdmin
      .from('file_access')
      .select('*')
      .eq('access_token', accessToken)
      .eq('product_id', productId)
      .single();

    if (fetchError || !accessRecord) {
      return NextResponse.json({ 
        error: 'Invalid access token' 
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

    // Increment download count
    const { data: updatedRecord, error: updateError } = await supabaseAdmin
      .from('file_access')
      .update({ download_count: accessRecord.download_count + 1 })
      .eq('access_token', accessToken)
      .select()
      .single();

    if (updateError) {
      console.error('Download count update error:', updateError);
      // Still return success if download tracking fails
    }

    // Log download event
    console.log(`Download tracked: Product ${productId}, Token ${accessToken}, Count: ${updatedRecord?.download_count || accessRecord.download_count + 1}`);

    return NextResponse.json({
      success: true,
      downloadCount: updatedRecord?.download_count || accessRecord.download_count + 1
    });

  } catch (error: any) {
    console.error('Download tracking error:', error);
    return NextResponse.json({ 
      error: 'Failed to track download',
      details: error.message
    }, { status: 500 });
  }
}

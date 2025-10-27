import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('Fetching product with slug:', resolvedParams.slug);
    
    // Find product by slug in Supabase
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .eq('paused', false)
      .single();
    
    if (error || !product) {
      console.log('Product not found for slug:', resolvedParams.slug);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('Found product:', product.title);
    return NextResponse.json({ 
      success: true,
      product 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

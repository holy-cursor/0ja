import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Clear the global products cache
    if (global.__products) {
      global.__products.length = 0; // Clear the array
    }
    
    console.log('Products cache cleared');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Products cache cleared',
      count: global.__products?.length || 0
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    count: global.__products?.length || 0,
    products: global.__products || []
  });
}

import { NextRequest, NextResponse } from 'next/server';

// Mock database - in production, use Supabase or your database
const fileAccess = new Map();

export async function POST(request: NextRequest) {
  try {
    const { accessToken, productId } = await request.json();

    if (!accessToken || !productId) {
      return NextResponse.json({ 
        error: 'Missing required fields: accessToken, productId' 
      }, { status: 400 });
    }

    const accessRecord = fileAccess.get(accessToken);

    if (!accessRecord) {
      return NextResponse.json({ 
        error: 'Invalid access token' 
      }, { status: 404 });
    }

    // Check if token is expired
    if (new Date() > new Date(accessRecord.expiresAt)) {
      fileAccess.delete(accessToken);
      return NextResponse.json({ 
        error: 'Access token has expired' 
      }, { status: 410 });
    }

    // Increment download count
    accessRecord.downloadCount += 1;
    fileAccess.set(accessToken, accessRecord);

    // Log download event
    console.log(`Download tracked: Product ${productId}, Token ${accessToken}, Count: ${accessRecord.downloadCount}`);

    return NextResponse.json({
      success: true,
      downloadCount: accessRecord.downloadCount
    });

  } catch (error) {
    console.error('Download tracking error:', error);
    return NextResponse.json({ 
      error: 'Failed to track download' 
    }, { status: 500 });
  }
}

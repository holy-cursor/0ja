import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';

/**
 * File serving endpoint - supports both legacy local files and Supabase Storage
 * Note: New files are stored in Supabase Storage with public URLs, so direct access is preferred.
 * This endpoint is kept for backward compatibility.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const fileName = resolvedParams.path[resolvedParams.path.length - 1];
    
    // Try to fetch from Supabase Storage first
    try {
      const { data, error } = await supabaseAdmin.storage
        .from('product-files')
        .download(fileName);

      if (!error && data) {
        // Convert blob to buffer
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Get content type from file extension
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        const contentTypes: { [key: string]: string } = {
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'txt': 'text/plain',
          'zip': 'application/zip',
          'rar': 'application/x-rar-compressed',
          'mp4': 'video/mp4',
          'mp3': 'audio/mpeg',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
        };
        
        const contentType = contentTypes[ext] || 'application/octet-stream';
        
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
        headers.set('Content-Length', buffer.length.toString());
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        
        return new NextResponse(buffer, {
          status: 200,
          headers,
        });
      }
    } catch (storageError) {
      console.log('File not found in Supabase Storage, trying legacy path...');
    }
    
    // If not found in storage, return 404
    // Legacy local file support removed (doesn't work on Vercel serverless)
    return NextResponse.json(
      { 
        error: 'File not found',
        message: 'This file may have been migrated to Supabase Storage. Please use the public URL directly.'
      },
      { status: 404 }
    );
    
  } catch (error: any) {
    console.error('File serve error:', error);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}

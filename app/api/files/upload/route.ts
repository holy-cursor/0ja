import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'video/mp4',
      'audio/mpeg',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not supported. Allowed: PDF, DOC, TXT, ZIP, MP4, MP3, Images' 
      }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage (private bucket)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-files')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload file to storage',
        details: uploadError.message
      }, { status: 500 });
    }

    // Check if file is an image (images need public URLs for display)
    const isImage = file.type.startsWith('image/');
    const filePath = `product-files/${fileName}`;
    
    // For images, generate a signed URL that's valid for a long time (1 year)
    // This allows images to be displayed publicly without needing tokens
    if (isImage) {
      const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
        .from('product-files')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      if (signedUrlError || !signedUrlData) {
        console.error('Error generating signed URL for image:', signedUrlError);
        // Fallback to path if signed URL generation fails
        return NextResponse.json({
          success: true,
          file: {
            id: uuidv4(),
            name: file.name,
            size: file.size,
            type: file.type,
            path: filePath,
            url: filePath, // Fallback to path
            uploadedAt: new Date().toISOString()
          }
        });
      }

      // Return signed URL for images
      return NextResponse.json({
        success: true,
        file: {
          id: uuidv4(),
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath,
          url: signedUrlData.signedUrl, // Signed URL for images
          uploadedAt: new Date().toISOString()
        }
      });
    }

    // For non-image files, return the path (they'll use signed URLs on-demand via access tokens)
    return NextResponse.json({
      success: true,
      file: {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        url: filePath, // Path for non-images (requires access token)
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error.message
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { extname } from 'path';
import { createReadStream } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = join(process.cwd(), 'public', 'uploads', ...resolvedParams.path);
    
    // Check if file exists and get stats
    const fileStats = await stat(filePath);
    
    // Get file extension for content type
    const ext = extname(filePath).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    // Set headers for better caching and download
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${resolvedParams.path[resolvedParams.path.length - 1]}"`);
    headers.set('Content-Length', fileStats.size.toString());
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', `"${fileStats.mtime.getTime()}-${fileStats.size}"`);
    
    // For large files, use streaming
    if (fileStats.size > 1024 * 1024) { // 1MB
      const stream = createReadStream(filePath);
      return new NextResponse(stream as ReadableStream, {
        status: 200,
        headers,
      });
    } else {
      // For small files, read into memory
      const fileBuffer = await readFile(filePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    }
    
  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}

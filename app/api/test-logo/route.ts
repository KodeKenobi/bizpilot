import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoExists = fs.existsSync(logoPath);
    
    return NextResponse.json({
      logoExists,
      logoPath,
      publicDirContents: fs.readdirSync(path.join(process.cwd(), 'public')),
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('Error checking logo:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

/**
 * Memory Image Upload API
 *
 * POST /api/memory-images
 * Body: form-data with fields:
 *  - elderId (string)
 *  - file (binary image)
 *
 * Uploads to Supabase storage bucket `memory-images/{elderId}/{uuid}.jpg`
 * Returns { url }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const elderId = formData.get('elderId');
    const file = formData.get('file') as File | null;

    if (!elderId || typeof elderId !== 'string') {
      return NextResponse.json({ error: 'elderId is required' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const fileExt = file.type.split('/')[1] || 'jpg';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `memory-images/${elderId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('memory-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image', details: uploadError.message },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from('memory-images').getPublicUrl(filePath);

    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error('Error in POST /api/memory-images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


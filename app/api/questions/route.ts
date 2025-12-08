/**
 * Questions API Route
 * 
 * Handles GET requests to fetch questions for an elder.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * GET /api/questions
 * Fetches questions for an elder
 * Query params: elderId (required), limit (optional, default 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 5;

    // Validate required query param
    if (!elderId) {
      return NextResponse.json(
        { error: 'elderId query parameter is required' },
        { status: 400 }
      );
    }

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'limit must be a number between 1 and 100' },
        { status: 400 }
      );
    }

    // Build query
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questions', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


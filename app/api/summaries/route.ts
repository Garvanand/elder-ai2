/**
 * Summaries API Route
 *
 * GET /api/summaries
 * Query params:
 * - elderId (required)
 * - date (optional, yyyy-mm-dd)
 * - limit (optional, default 7)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId');
    const date = searchParams.get('date');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 7;

    if (!elderId) {
      return NextResponse.json(
        { error: 'elderId query parameter is required' },
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'limit must be a number between 1 and 100' },
        { status: 400 }
      );
    }

    if (date) {
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('elder_id', elderId)
        .eq('date', date)
        .order('date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching summary by date:', error);
        return NextResponse.json(
          { error: 'Failed to fetch summaries', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(data || []);
    }

    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('elder_id', elderId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching summaries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch summaries', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/summaries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


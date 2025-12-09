/**
 * Daily Summary API Route
 *
 * POST /api/summaries/daily
 * Body: { elderId: string, date?: string }
 *
 * - If date not provided, uses today's date (server time, yyyy-mm-dd)
 * - Fetches memories for that day, generates summary via generateDailySummary
 * - Upserts into daily_summaries table
 * - Returns { summary, memoriesCount }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { generateDailySummary } from '@/lib/ai';
import type { Memory } from '@/src/types';

interface DailySummaryRequest {
  elderId: string;
  date?: string;
}

function isValidRequest(body: unknown): body is DailySummaryRequest {
  if (typeof body !== 'object' || body === null) return false;
  const req = body as Record<string, unknown>;
  return typeof req.elderId === 'string' && req.elderId.length > 0;
}

function getDateString(dateInput?: string): string {
  if (dateInput && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!isValidRequest(body)) {
      return NextResponse.json(
        { error: 'Missing required field: elderId' },
        { status: 400 }
      );
    }

    const date = getDateString(body.date);
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59.999`);

    const { data: memoriesData, error: memoriesError } = await supabase
      .from('memories')
      .select('*')
      .eq('elder_id', body.elderId)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: true });

    if (memoriesError) {
      console.error('Error fetching memories:', memoriesError);
      return NextResponse.json(
        { error: 'Failed to fetch memories', details: memoriesError.message },
        { status: 500 }
      );
    }

    const typedMemories: Memory[] = (memoriesData || []).map((m) => ({
      id: m.id,
      elder_id: m.elder_id,
      type: m.type,
      raw_text: m.raw_text,
      structured_json: (m.structured_json as Record<string, unknown>) || {},
      tags: m.tags || [],
      created_at: m.created_at,
      updated_at: m.updated_at,
    }));

    const summary = await generateDailySummary(typedMemories);

    const { error: upsertError } = await supabase
      .from('daily_summaries')
      .upsert(
        {
          elder_id: body.elderId,
          date,
          summary_text: summary,
        },
        { onConflict: 'elder_id,date' }
      );

    if (upsertError) {
      console.error('Error upserting summary:', upsertError);
      return NextResponse.json(
        { error: 'Failed to save summary', details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      summary,
      memoriesCount: typedMemories.length,
    });
  } catch (error) {
    console.error('Error in POST /api/summaries/daily:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


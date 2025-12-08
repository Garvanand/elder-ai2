/**
 * API Helper Functions
 * 
 * Type-safe functions for calling backend API endpoints.
 */

import type { MemoryType } from '@/src/types';
import type { Memory, Question, AnswerResponse } from '@/src/types';

const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000';

/**
 * Get the current elder ID from query params or use default
 */
export function getElderId(): string {
  if (typeof window === 'undefined') {
    return 'default-elder-id';
  }

  const params = new URLSearchParams(window.location.search);
  const elderId = params.get('elderId');
  const role = params.get('role');
  
  // If role=elder, we'll use a default elder ID for now
  // Later this will come from Supabase auth
  if (role === 'elder' || elderId) {
    return elderId || 'default-elder-id';
  }
  
  return 'default-elder-id';
}

/**
 * Create a new memory
 */
export async function createMemory(
  elderId: string,
  type: MemoryType,
  text: string
): Promise<Memory> {
  const response = await fetch(`${API_BASE_URL}/api/memories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      elderId,
      type,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create memory' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Map database response to Memory type
  return {
    id: data.id,
    elder_id: data.elder_id,
    type: data.type,
    raw_text: data.raw_text,
    structured_json: (data.structured_json as Record<string, unknown>) || {},
    tags: data.tags || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Get memories for an elder
 */
export async function getMemories(
  elderId: string,
  filters?: {
    type?: MemoryType;
    tag?: string;
  }
): Promise<Memory[]> {
  const params = new URLSearchParams({
    elderId,
  });

  if (filters?.type) {
    params.append('type', filters.type);
  }

  if (filters?.tag) {
    params.append('tag', filters.tag);
  }

  const response = await fetch(`${API_BASE_URL}/api/memories?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch memories' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Map database responses to Memory type
  return (data || []).map((m: any) => ({
    id: m.id,
    elder_id: m.elder_id,
    type: m.type,
    raw_text: m.raw_text,
    structured_json: (m.structured_json as Record<string, unknown>) || {},
    tags: m.tags || [],
    created_at: m.created_at,
    updated_at: m.updated_at,
  }));
}

/**
 * Answer a question using elder's memories
 */
export async function answerQuestion(
  elderId: string,
  question: string
): Promise<AnswerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/questions/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      elderId,
      question,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to answer question' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Map matched memories to Memory type
  const matchedMemories: Memory[] = (data.matchedMemories || []).map((m: any) => ({
    id: m.id,
    elder_id: m.elder_id,
    type: m.type,
    raw_text: m.raw_text,
    structured_json: (m.structured_json as Record<string, unknown>) || {},
    tags: m.tags || [],
    created_at: m.created_at,
    updated_at: m.updated_at,
  }));

  return {
    answer: data.answer,
    matchedMemories,
  };
}

/**
 * Get questions for an elder
 */
export async function getQuestions(
  elderId: string,
  limit: number = 5
): Promise<Question[]> {
  const params = new URLSearchParams({
    elderId,
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/api/questions?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch questions' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Map database responses to Question type
  return (data || []).map((q: any) => ({
    id: q.id,
    elder_id: q.elder_id,
    question_text: q.question_text,
    answer_text: q.answer_text,
    matched_memory_ids: (q.matched_memory_ids as string[]) || [],
    created_at: q.created_at,
  }));
}


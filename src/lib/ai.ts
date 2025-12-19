/**
 * AI Module for Memory Friend
 * 
 * This module contains AI-related functions using Gemini API directly.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Memory, AnswerResponse, BehavioralSignal } from "@/types";


// Get Gemini API key from environment
const getGeminiApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return (import.meta.env?.VITE_GEMINI_API_KEY as string) || null;
  }
  return (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || null;
};


/**
 * Answer a question using the elder's memories as context
 */
export async function answerQuestion(
  question: string,
  elderId: string
): Promise<AnswerResponse> {
  // Fetch elder's memories
  const { data: memories, error: memError } = await supabase
    .from('memories')
    .select('*')
    .eq('elder_id', elderId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (memError) {
    console.error('Error fetching memories:', memError);
    throw new Error(memError.message || 'Failed to get answer');
  }

  // Also track this as a potential behavioral signal (repeated questions)
  await trackQuestionActivity(question, elderId);

  const apiKey = getGeminiApiKey();
  
  if (apiKey && memories && memories.length > 0) {
    try {
      return await answerQuestionWithGemini(question, memories as Memory[], apiKey);
    } catch (error: any) {
      console.warn('Gemini API failed, falling back to keyword matching:', error);
    }
  }

  // Fallback: keyword matching
  const result = matchMemoriesByKeyword(question, memories || []);
  const latest = result[0];

  if (!latest) {
    return {
      answer: "I don't have any memories that match your question yet. Try adding a memory about this topic.",
      matchedMemories: [],
    };
  }

  return {
    answer: `Last time you mentioned this was: ${latest.raw_text}`,
    matchedMemories: [latest],
  };
}

/**
 * Track question to detect "repeated question" behavioral signals
 */
async function trackQuestionActivity(question: string, elderId: string) {
  const { data: recentQuestions } = await supabase
    .from('questions')
    .select('question_text')
    .eq('elder_id', elderId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentQuestions && recentQuestions.length >= 3) {
    const similarCount = recentQuestions.filter(q => 
      q.question_text.toLowerCase().includes(question.toLowerCase().slice(0, 10))
    ).length;

    if (similarCount >= 2) {
      await supabase.from('behavioral_signals').insert({
        elder_id: elderId,
        signal_type: 'repeated_question',
        severity: 'low',
        description: `Elder asked a similar question multiple times recently: "${question}"`,
        metadata: { question }
      });
    }
  }
}

/**
 * Answer question using Gemini API
 */
async function answerQuestionWithGemini(
  question: string,
  memories: Memory[],
  apiKey: string
): Promise<AnswerResponse> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const memoryContext = memories.slice(0, 15).map((m, i) => 
    `Memory ${i + 1}: ${m.raw_text} (Type: ${m.type})`
  ).join('\n\n');

  const prompt = `You are a warm, emotionally intelligent memory assistant for an elderly person. 
Answer their question based ONLY on the provided memories.

Question: "${question}"

Memories Context:
${memoryContext}

Guidelines:
- If the memories contain the answer, provide it warmly.
- If not, say something like "I don't remember us talking about that yet, but I'd love to hear the story!"
- Keep it to 1-2 short, simple sentences.
- Focus on emotional connection.
- Use names if available.

Answer:`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {}
    });
    const answer = result.response.text().trim();

  // Simple relevance filtering
  const matchedMemories = matchMemoriesByKeyword(question, memories).slice(0, 3);

  return {
    answer,
    matchedMemories,
  };
}

/**
 * Extract structured intelligence from raw memory
 */
export async function extractMemoryIntelligence(rawText: string): Promise<{
  type: string;
  tags: string[];
  emotional_tone: string;
  confidence_score: number;
  structured: Record<string, unknown>;
}> {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) return extractMemoryIntelligenceNaive(rawText);

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this memory text from an elderly person:
"${rawText}"

Extract and return ONLY a JSON object:
{
  "type": "story|person|event|medication|routine|preference|other",
  "emotional_tone": "happy|nostalgic|confused|sad|neutral",
  "confidence_score": 0.0 to 1.0 (how clear is the memory),
  "tags": ["3-5 keywords"],
  "structured": {
    "people": [],
    "locations": [],
    "time": "if mentioned",
    "key_details": []
  }
}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {}
    });
    const responseText = result.response.text().trim();
    const jsonText = responseText.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(jsonText);

    return {
      type: parsed.type || 'other',
      tags: parsed.tags || [],
      emotional_tone: parsed.emotional_tone || 'neutral',
      confidence_score: parsed.confidence_score || 0.8,
      structured: parsed.structured || {},
    };
  } catch (error) {
    console.error('Gemini intelligence extraction failed:', error);
    return extractMemoryIntelligenceNaive(rawText);
  }
}

function extractMemoryIntelligenceNaive(rawText: string) {
  return {
    type: 'other',
    tags: [],
    emotional_tone: 'neutral',
    confidence_score: 0.5,
    structured: {},
  };
}

/**
 * Generate a proactive "Life Recap" summary
 */
export async function generateWeeklyRecap(elderId: string): Promise<string> {
  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('elder_id', elderId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (!memories || memories.length < 3) return "We're just starting to collect your beautiful stories. Keep sharing!";

  const apiKey = getGeminiApiKey();
  if (!apiKey) return "You've been busy sharing memories lately!";

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const memoryFeed = memories.map(m => m.raw_text).join('\n');
    const prompt = `Create a "Weekly Life Recap" for an elderly person based on these memories:
${memoryFeed}

Tone: Warm, celebratory, dignified.
Length: 3-4 short sentences.
Focus: On what they've been talking about most and positive highlights.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {}
    });
    return result.response.text().trim();
  } catch (error) {
    return "You've shared some wonderful moments this week!";
  }
}

/**
 * Keyword matching fallback
 */
export function matchMemoriesByKeyword(
  question: string,
  memories: Memory[]
): Memory[] {
  const keywords = question
    .toLowerCase()
    .replace(/[?.,!]/g, '')
    .split(' ')
    .filter(word => word.length > 3);

  return memories.filter(memory => {
    const text = memory.raw_text.toLowerCase();
    const tags = (memory.tags || []).map(t => t.toLowerCase());
    
    return keywords.some(keyword => 
      text.includes(keyword) || tags.some(tag => tag.includes(keyword))
    );
  });
}

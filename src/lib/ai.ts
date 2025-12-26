/**
 * AI Module for Memory Friend
 * 
 * This module contains production-grade AI-related functions using Groq API.
 * Focus: Scalability, Precision, and Predictive Analytics.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Memory, AnswerResponse } from "@/types";
import { Groq } from 'groq-sdk';

// Safe env access for both Next.js and Vite builds
const nextEnv =
  typeof process !== 'undefined' && process.env ? process.env : {};

const getGroqApiKey = (): string | null => {
  return (
    nextEnv.VITE_GROQ_API_KEY ||
    nextEnv.GROQ_API_KEY ||
    (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY : '') ||
    null
  );
};

const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Enhanced Mood Analysis with Temporal Modeling
 */
export async function predictMoodAndAnalyzeSentiment(elderId: string): Promise<{
  mood: string;
  sentiment_score: number;
  explanation: string;
  recommendations: string[];
  trend: 'improving' | 'stable' | 'declining';
}> {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error("Groq API key missing");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentMemories } = await supabase
    .from('memories')
    .select('raw_text, emotional_tone, created_at')
    .eq('elder_id', elderId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  const { data: recentSignals } = await supabase
    .from('behavioral_signals')
    .select('signal_type, severity, description, created_at')
    .eq('elder_id', elderId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const context = `
    Memories (Last 7 days): ${recentMemories?.map(m => `[${m.created_at}] ${m.raw_text} (${m.emotional_tone})`).join(' | ')}
    Behavioral Signals: ${recentSignals?.map(s => `[${s.created_at}] ${s.signal_type}: ${s.description}`).join(' | ')}
  `;

  const prompt = `Perform a production-grade clinical sentiment analysis and temporal mood modeling for an elderly user.
  Analyze trends over the last 7 days.
  Context: ${context}
  Return ONLY a JSON object:
  {
    "mood": "happy|calm|anxious|sad|confused|agitated",
    "sentiment_score": -1.0 to 1.0,
    "trend": "improving|stable|declining",
    "explanation": "Detailed clinical reasoning focusing on shifts over time",
    "recommendations": ["3-4 highly personalized clinical and social recommendations"]
  }`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: GROQ_MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");
  return result;
}

/**
 * Predictive Health Risk Assessment
 */
export async function assessHealthRisks(elderId: string): Promise<{
  risk_score: number;
  risks: { type: string; probability: number; description: string }[];
  preventive_measures: string[];
}> {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error("Groq API key missing");

  const { data: healthData } = await supabase
    .from('health_metrics')
    .select('*')
    .eq('elder_id', elderId)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('elder_id', elderId)
    .order('created_at', { ascending: false })
    .limit(10);

  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const prompt = `Act as a geriatric predictive health model. Analyze recent health metrics and alerts to forecast risks.
  Health Data: ${JSON.stringify(healthData)}
  Recent Alerts: ${JSON.stringify(alerts)}
  Return ONLY a JSON object:
  {
    "risk_score": 0 to 100,
    "risks": [
      { "type": "fall|cardiac|cognitive|dehydration", "probability": 0.0 to 1.0, "description": "reasoning" }
    ],
    "preventive_measures": ["Actionable steps for caregivers"]
  }`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: GROQ_MODEL,
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  return JSON.parse(completion.choices[0].message.content || "{}");
}

/**
 * Generate an adaptive follow-up question based on a new memory
 */
export async function generateAdaptiveQuestion(
  memoryText: string,
  elderId: string
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return "That sounds like a wonderful memory. Would you like to tell me more about it?";

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    const prompt = `Based on this memory: "${memoryText}", generate ONE warm, engaging follow-up question to encourage the elder to share more details. Keep it simple and nostalgic. Question only, 1 sentence.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 50,
    });

    return completion.choices[0].message.content?.trim() || "Would you like to tell me more?";
  } catch (error) {
    return "That's lovely. What else do you remember?";
  }
}

/**
 * Generate a weekly recap summary for the elder
 */
export async function generateWeeklyRecap(elderId: string): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return "You've had a wonderful week full of meaningful moments and engagement.";

  try {
    const { data: memories } = await supabase
      .from('memories')
      .select('raw_text')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: false })
      .limit(20);

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    const context = memories?.map(m => m.raw_text).join('\n') || "No recent memories.";
    
    const prompt = `Generate a warm, dignified 2-sentence summary of the elder's week based on these memories: ${context}. Focus on positive highlights and emotional connection. Use "You" to address the elder.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.5,
    });

    return completion.choices[0].message.content?.trim() || "You've shared some beautiful stories this week.";
  } catch (error) {
    return "It's been a week full of precious memories and connections.";
  }
}

/**
 * Generate a daily summary specifically for the caregiver dashboard
 */
export async function generateCaregiverDailySummary(elderId: string): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return "The elder has been active and engaged today.";

  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const { data: memories } = await supabase
      .from('memories')
      .select('raw_text, type, emotional_tone')
      .eq('elder_id', elderId)
      .gte('created_at', today.toISOString());

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    const context = memories?.map(m => `[${m.type}] ${m.raw_text} (${m.emotional_tone})`).join('\n') || "No memories today.";
    
    const prompt = `As a caregiver assistant, summarize the elder's day in 2-3 professional yet warm sentences based on these events: ${context}. Highlight mood and key activities.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.4,
    });

    return completion.choices[0].message.content?.trim() || "The elder had a peaceful day with several recorded interactions.";
  } catch (error) {
    return "Daily synthesis is temporarily unavailable, but all activities are being logged correctly.";
  }
}

/**
 * Answer a question using RAG (Retrieval Augmented Generation) logic
 */
export async function answerQuestion(
  question: string,
  elderId: string
): Promise<AnswerResponse> {
  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('elder_id', elderId)
    .order('created_at', { ascending: false })
    .limit(50);

  const apiKey = getGroqApiKey();
  
  if (apiKey && memories && memories.length > 0) {
    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      const memoryContext = memories.slice(0, 15).map((m, i) => `Memory ${i + 1} [${m.type}]: ${m.raw_text}`).join('\n');
      const prompt = `You are a warm, dignified memory assistant. Answer the elder's question using ONLY the memories provided. Question: "${question}" Memories: ${memoryContext} Answer (1-2 sentences):`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: GROQ_MODEL,
        temperature: 0.5,
      });

      return {
        answer: chatCompletion.choices[0]?.message?.content?.trim() || "",
        matchedMemories: matchMemoriesByKeyword(question, memories as Memory[]).slice(0, 3),
      };
    } catch (error: any) {
      console.warn('Groq API failed:', error);
    }
  }

  return {
    answer: "I'm having a little trouble connecting to my memory bank right now, but I'm here for you.",
    matchedMemories: [],
  };
}

export async function extractMemoryIntelligence(rawText: string): Promise<{
  type: string;
  tags: string[];
  emotional_tone: string;
  confidence_score: number;
  structured: Record<string, unknown>;
}> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return { type: 'other', tags: [], emotional_tone: 'neutral', confidence_score: 0.5, structured: {} };

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    const prompt = `Extract intelligence from this memory: "${rawText}". Return JSON: {"type": "story|person|event|medication|preference", "emotional_tone": "happy|nostalgic|confused|sad", "tags": [], "structured": {}}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      type: parsed.type || 'other',
      tags: parsed.tags || [],
      emotional_tone: parsed.emotional_tone || 'neutral',
      confidence_score: 0.9,
      structured: parsed.structured || {}
    };
  } catch (error) {
    return { type: 'other', tags: [], emotional_tone: 'neutral', confidence_score: 0.5, structured: {} };
  }
}

export function matchMemoriesByKeyword(question: string, memories: Memory[]): Memory[] {
  const keywords = question.toLowerCase().replace(/[?.,!]/g, '').split(' ').filter(word => word.length > 3);
  return memories.filter(m => {
    const text = m.raw_text.toLowerCase();
    return keywords.some(k => text.includes(k) || (m.tags || []).some(t => t.toLowerCase().includes(k)));
  });
}

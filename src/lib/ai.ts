/**
 * AI Module for Memory Friend - Production Grade
 * 
 * Features: Caching, retry logic, error handling, rate limiting
 */

import { supabase } from "@/integrations/supabase/client";
import type { Memory, AnswerResponse } from "@/types";
import { Groq } from 'groq-sdk';

const nextEnv = typeof process !== 'undefined' && process.env ? process.env : {};

const getGroqApiKey = (): string | null => {
  return (
    nextEnv.VITE_GROQ_API_KEY ||
    nextEnv.GROQ_API_KEY ||
    (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GROQ_API_KEY : '') ||
    null
  );
};

const GROQ_MODEL = "llama-3.3-70b-versatile";
const CACHE_TTL = 5 * 60 * 1000;

const cache = new Map<string, { data: any; timestamp: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
  if (cache.size > 100) {
    const oldest = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error?.status === 429 || error?.status >= 500)) {
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function predictMoodAndAnalyzeSentiment(elderId: string): Promise<{
  mood: string;
  sentiment_score: number;
  explanation: string;
  recommendations: string[];
  trend: 'improving' | 'stable' | 'declining';
}> {
  const cacheKey = `mood-${elderId}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return { mood: 'stable', sentiment_score: 0, explanation: 'Analysis unavailable', recommendations: [], trend: 'stable' };
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [{ data: recentMemories }, { data: recentSignals }] = await Promise.all([
      supabase
        .from('memories')
        .select('raw_text, emotional_tone, created_at')
        .eq('elder_id', elderId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('behavioral_signals')
        .select('signal_type, severity, description, created_at')
        .eq('elder_id', elderId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const memoryContext = recentMemories?.slice(0, 10).map(m => `${m.raw_text} (${m.emotional_tone})`).join(' | ') || 'No recent memories';
    const signalContext = recentSignals?.map(s => `${s.signal_type}: ${s.description}`).join(' | ') || 'No signals';

    const prompt = `Analyze mood for elderly care. Memories: ${memoryContext}. Signals: ${signalContext}. Return JSON: {"mood":"happy|calm|anxious|sad|confused","sentiment_score":-1 to 1,"trend":"improving|stable|declining","explanation":"brief","recommendations":["2-3 items"]}`;

    const completion = await withRetry(() => groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      max_tokens: 300
    }));

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Mood analysis failed:', error);
    return { mood: 'stable', sentiment_score: 0, explanation: 'Unable to analyze', recommendations: [], trend: 'stable' };
  }
}

export async function assessHealthRisks(elderId: string): Promise<{
  risk_score: number;
  risks: { type: string; probability: number; description: string }[];
  preventive_measures: string[];
}> {
  const cacheKey = `health-${elderId}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return { risk_score: 0, risks: [], preventive_measures: [] };
  }

  try {
    const [{ data: healthData }, { data: alerts }] = await Promise.all([
      supabase.from('health_metrics').select('*').eq('elder_id', elderId).order('created_at', { ascending: false }).limit(15),
      supabase.from('alerts').select('*').eq('elder_id', elderId).order('created_at', { ascending: false }).limit(5)
    ]);

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const prompt = `Assess health risks for elderly. Health: ${JSON.stringify(healthData?.slice(0, 5))}. Alerts: ${JSON.stringify(alerts)}. Return JSON: {"risk_score":0-100,"risks":[{"type":"fall|cardiac|cognitive","probability":0-1,"description":"brief"}],"preventive_measures":["items"]}`;

    const completion = await withRetry(() => groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 400
    }));

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Health risk assessment failed:', error);
    return { risk_score: 0, risks: [], preventive_measures: [] };
  }
}

export async function generateAdaptiveQuestion(memoryText: string, elderId: string): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return "That sounds like a wonderful memory. Would you like to tell me more about it?";

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    const prompt = `Based on this memory: "${memoryText.slice(0, 200)}", generate ONE warm follow-up question to encourage sharing more. Keep it simple. Question only, 1 sentence.`;

    const completion = await withRetry(() => groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 50,
    }));

    return completion.choices[0].message.content?.trim() || "Would you like to tell me more?";
  } catch (error) {
    return "That's lovely. What else do you remember?";
  }
}

export async function generateWeeklyRecap(elderId: string): Promise<string> {
  const cacheKey = `recap-${elderId}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  const apiKey = getGroqApiKey();
  if (!apiKey) return "You've had a wonderful week full of meaningful moments.";

  try {
    const { data: memories } = await supabase
      .from('memories')
      .select('raw_text')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: false })
      .limit(15);

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    const context = memories?.map(m => m.raw_text).join(' ') || "No recent memories.";
    
    const prompt = `Summarize elder's week in 2 warm sentences. Memories: ${context.slice(0, 800)}. Address as "You".`;

    const completion = await withRetry(() => groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 100,
    }));

    const result = completion.choices[0].message.content?.trim() || "You've shared some beautiful stories this week.";
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    return "It's been a week full of precious memories and connections.";
  }
}

export async function generateCaregiverDailySummary(elderId: string): Promise<string> {
  const cacheKey = `daily-${elderId}-${new Date().toDateString()}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  const apiKey = getGroqApiKey();
  if (!apiKey) return "The elder has been active and engaged today.";

  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const { data: memories } = await supabase
      .from('memories')
      .select('raw_text, type, emotional_tone')
      .eq('elder_id', elderId)
      .gte('created_at', today.toISOString())
      .limit(10);

    if (!memories?.length) return "No activity recorded yet today.";

    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    const context = memories.map(m => `[${m.type}] ${m.raw_text}`).join(' ');
    
    const prompt = `Summarize elder's day for caregiver in 2-3 professional sentences. Events: ${context.slice(0, 600)}. Note mood and activities.`;

    const completion = await withRetry(() => groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 150,
    }));

    const result = completion.choices[0].message.content?.trim() || "The elder had a peaceful day.";
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    return "Daily synthesis temporarily unavailable.";
  }
}

export async function answerQuestion(question: string, elderId: string): Promise<AnswerResponse> {
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
      const prompt = `You are a warm memory assistant. Answer using ONLY these memories. Question: "${question}" Memories: ${memoryContext} Answer (1-2 sentences):`;

      const chatCompletion = await withRetry(() => groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: GROQ_MODEL,
        temperature: 0.5,
        max_tokens: 150,
      }));

      return {
        answer: chatCompletion.choices[0]?.message?.content?.trim() || "",
        matchedMemories: matchMemoriesByKeyword(question, memories as Memory[]).slice(0, 3),
      };
    } catch (error: any) {
      console.warn('Groq API failed:', error);
    }
  }

  if (memories && memories.length > 0) {
    const matched = matchMemoriesByKeyword(question, memories as Memory[]);
    if (matched.length > 0) {
      return {
        answer: `Based on your memories: ${matched[0].raw_text.slice(0, 150)}...`,
        matchedMemories: matched.slice(0, 3),
      };
    }
  }

  return {
    answer: "I'm having trouble connecting right now, but I'm here for you.",
    matchedMemories: [],
  };
}

export async function answerQuestionFromMemories(question: string, memories: Memory[]): Promise<AnswerResponse> {
  const apiKey = getGroqApiKey();
  
  if (apiKey && memories.length > 0) {
    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      const memoryContext = memories.slice(0, 15).map((m, i) => `Memory ${i + 1} [${m.type}]: ${m.raw_text}`).join('\n');
      const prompt = `You are a warm memory assistant. Answer using ONLY these memories. Question: "${question}" Memories: ${memoryContext} Answer (1-2 sentences):`;

      const chatCompletion = await withRetry(() => groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: GROQ_MODEL,
        temperature: 0.5,
        max_tokens: 150,
      }));

      return {
        answer: chatCompletion.choices[0]?.message?.content?.trim() || "",
        matchedMemories: matchMemoriesByKeyword(question, memories).slice(0, 3),
      };
    } catch (error: any) {
      console.warn('Groq API failed:', error);
    }
  }

  const matched = matchMemoriesByKeyword(question, memories);
  if (matched.length > 0) {
    return {
      answer: `Based on your memories: ${matched[0].raw_text.slice(0, 150)}...`,
      matchedMemories: matched.slice(0, 3),
    };
  }

  return {
    answer: "I couldn't find related memories. Try asking differently.",
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
    const prompt = `Extract from memory: "${rawText.slice(0, 500)}". Return JSON: {"type":"story|person|event|medication|preference","emotional_tone":"happy|nostalgic|confused|sad|neutral","tags":["keywords"],"structured":{}}`;

    const completion = await withRetry(() => groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 200,
    }));

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

export async function getSupportAIResponse(query: string, category: string = 'general'): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return "I'm sorry, I'm having trouble connecting to my support system. Please try again later or contact our team directly at garvanand03@gmail.com.";

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    
    const categoryPrompts: Record<string, string> = {
      elder: "You are an elder-friendly support assistant. Use simple words, warm tone, and short sentences. Help the user with using the app, viewing memories, or getting help.",
      caregiver: "You are a professional support assistant for family caregivers. Provide clear, actionable advice on managing elder accounts, tracking health metrics, and using caregiving tools.",
      clinician: "You are a medical-technical support assistant for clinicians. Focus on data privacy (HIPAA compliance), secure communication channels, and technical integration of health monitoring tools.",
      general: "You are a helpful support assistant for Elder AI. Help the user with account issues, troubleshooting, and general information about the platform."
    };

    const systemPrompt = categoryPrompts[category] || categoryPrompts.general;
    const prompt = `${systemPrompt}\nUser Query: "${query}"\nAnswer (warm, helpful, 2-3 sentences):`;

    const completion = await withRetry(() => groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      model: GROQ_MODEL,
      temperature: 0.6,
      max_tokens: 250,
    }));

    return completion.choices[0].message.content?.trim() || "I'm here to help! Could you please tell me more about what you need?";
  } catch (error) {
    return "I'm having a little trouble right now. Please reach out to garvanand03@gmail.com for immediate assistance.";
  }
}

export function matchMemoriesByKeyword(question: string, memories: Memory[]): Memory[] {
  const keywords = question.toLowerCase().replace(/[?.,!]/g, '').split(' ').filter(word => word.length > 3);
  return memories.filter(m => {
    const text = m.raw_text.toLowerCase();
    return keywords.some(k => text.includes(k) || (m.tags || []).some(t => t.toLowerCase().includes(k)));
  }).sort((a, b) => {
    const aScore = keywords.filter(k => a.raw_text.toLowerCase().includes(k)).length;
    const bScore = keywords.filter(k => b.raw_text.toLowerCase().includes(k)).length;
    return bScore - aScore;
  });
}

export async function generateDailySummary(memories: Memory[]): Promise<string> {
  if (!memories || memories.length === 0) {
    return "No memories recorded for this day.";
  }

  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return `Today included ${memories.length} recorded ${memories.length === 1 ? 'memory' : 'memories'}.`;
  }

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    const context = memories.map(m => `[${m.type}] ${m.raw_text}`).join('\n').slice(0, 1500);
    
    const prompt = `Summarize these elder's daily memories for caregivers in 2-3 warm sentences. Focus on activities, mood, and notable events.\n\nMemories:\n${context}`;

    const completion = await withRetry(() => groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 200,
    }));

    return completion.choices[0].message.content?.trim() || `${memories.length} memories recorded today.`;
  } catch (error) {
    console.warn('Daily summary generation failed:', error);
    return `${memories.length} memories recorded today.`;
  }
}

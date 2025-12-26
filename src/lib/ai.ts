/**
 * AI Module for Memory Friend
 * 
 * This module contains production-grade AI-related functions using Groq API.
 * Focus: Scalability, Precision, and Predictive Analytics.
 */

import { supabase } from "@/integrations/supabase/client";
import type { Memory, AnswerResponse, BehavioralSignal } from "@/types";
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

  // Fetch 7 days of behavioral signals and memories for temporal analysis
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
  
  Context:
  ${context}

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
  
  // High-severity alert generation
  if (result.trend === 'declining' || ['agitated', 'confused'].includes(result.mood)) {
    await supabase.from('alerts').insert({
      elder_id: elderId,
      type: 'health',
      message: `Cognitive/Mood Decline Detected: ${result.explanation}`,
      status: 'active',
      metadata: { ...result, source: 'ai_temporal_analysis' }
    });
  }

  return {
    mood: result.mood || 'calm',
    sentiment_score: result.sentiment_score || 0,
    explanation: result.explanation || 'No significant shifts detected.',
    recommendations: result.recommendations || [],
    trend: result.trend || 'stable'
  };
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
      // Track activity for repeated question detection
      await trackQuestionActivity(question, elderId);
      return await answerQuestionWithGroq(question, memories as Memory[], apiKey);
    } catch (error: any) {
      console.warn('Groq API failed, falling back:', error);
    }
  }

  return {
    answer: "I'm having a little trouble connecting to my memory bank right now, but I'm here for you.",
    matchedMemories: [],
  };
}

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

async function answerQuestionWithGroq(
  question: string,
  memories: Memory[],
  apiKey: string
): Promise<AnswerResponse> {
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  
  const memoryContext = memories.slice(0, 15).map((m, i) => 
    `Memory ${i + 1} [${m.type}]: ${m.raw_text}`
  ).join('\n');

  const prompt = `You are a warm, dignified memory assistant. 
  Answer the elder's question using ONLY the memories provided.
  If the answer is not in memories, gently encourage them to share more about that topic.

  Question: "${question}"
  Memories:
  ${memoryContext}

  Answer (1-2 sentences, very warm):`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: GROQ_MODEL,
    temperature: 0.5,
  });

  return {
    answer: chatCompletion.choices[0]?.message?.content?.trim() || "",
    matchedMemories: matchMemoriesByKeyword(question, memories).slice(0, 3),
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
    const prompt = `Extract intelligence from this elder's memory: "${rawText}"
    Return JSON:
    {
      "type": "story|person|event|medication|preference",
      "emotional_tone": "happy|nostalgic|confused|sad",
      "tags": ["3-5 keywords"],
      "structured": { "people": [], "locations": [], "time": "" }
    }`;

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

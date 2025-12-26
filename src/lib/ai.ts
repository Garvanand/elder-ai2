/**
 * AI Module for Memory Friend
 * 
 * This module contains AI-related functions using Groq API.
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
 * Predict elder's mood and perform sentiment analysis based on recent interactions
 */
export async function predictMoodAndAnalyzeSentiment(elderId: string): Promise<{
  mood: string;
  sentiment_score: number;
  explanation: string;
  recommendations: string[];
}> {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error("Groq API key missing");

  // Fetch recent memories and questions
  const { data: recentMemories } = await supabase
    .from('memories')
    .select('raw_text, emotional_tone, created_at')
    .eq('elder_id', elderId)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: recentQuestions } = await supabase
    .from('questions')
    .select('question_text, created_at')
    .eq('elder_id', elderId)
    .order('created_at', { ascending: false })
    .limit(5);

  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const context = `
    Recent Memories: ${recentMemories?.map(m => `${m.raw_text} (Tone: ${m.emotional_tone})`).join(' | ')}
    Recent Questions: ${recentQuestions?.map(q => q.question_text).join(' | ')}
  `;

  const prompt = `Analyze the emotional state and mood of an elderly person based on these recent interactions:
  ${context}

  Return ONLY a JSON object:
  {
    "mood": "happy|calm|anxious|sad|confused|agitated",
    "sentiment_score": -1.0 to 1.0,
    "explanation": "Brief reasoning for this mood prediction",
    "recommendations": ["2-3 personalized activity suggestions to improve or maintain this mood"]
  }`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: GROQ_MODEL,
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");
  
  // Save to behavioral_signals if mood is concerning
  if (['anxious', 'sad', 'confused', 'agitated'].includes(result.mood)) {
    await supabase.from('behavioral_signals').insert({
      elder_id: elderId,
      signal_type: 'mood_alert',
      severity: result.mood === 'agitated' ? 'high' : 'medium',
      description: `Potential ${result.mood} state detected: ${result.explanation}`,
      metadata: result
    });
  }

  return {
    mood: result.mood || 'calm',
    sentiment_score: result.sentiment_score || 0,
    explanation: result.explanation || 'No significant emotional shifts detected.',
    recommendations: result.recommendations || []
  };
}

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

  const apiKey = getGroqApiKey();
  
  if (apiKey && memories && memories.length > 0) {
    try {
      return await answerQuestionWithGroq(question, memories as Memory[], apiKey);
    } catch (error: any) {
      console.warn('Groq API failed, falling back to keyword matching:', error);
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
 * Answer question using Groq API
 */
async function answerQuestionWithGroq(
  question: string,
  memories: Memory[],
  apiKey: string
): Promise<AnswerResponse> {
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  
  const memoryContext = memories.slice(0, 15).map((m, i) => 
    `Memory ${i + 1}: ${m.raw_text} (Type: ${m.type})`
  ).join('\n\n');

  const prompt = `You are a warm, emotionally intelligent memory assistant for an elderly person. 
  Answer their question based ONLY on the provided memories.

  Step 1: Detect the emotional state of the user based on their question: "${question}".
  Step 2: Adapt your tone. If they are confused, be reassuring. If happy, be celebratory. If sad, be empathetic.

  Question: "${question}"

  Memories Context:
  ${memoryContext}

  Guidelines:
  - If the memories contain the answer, provide it warmly with emotional context.
  - If not, say something like "I don't remember us talking about that yet, but I'd love to hear more about it!"
  - Keep it to 1-2 short, simple sentences. Use larger words or simple ones depending on complexity.
  - Call them by name if the memory mentions "You" or a specific name.

  Answer:`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: GROQ_MODEL,
    temperature: 0.7,
    max_tokens: 500,
  });

  const answer = chatCompletion.choices[0]?.message?.content?.trim() || "";

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
  const apiKey = getGroqApiKey();
  
  if (!apiKey) return extractMemoryIntelligenceNaive(rawText);

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

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

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 1000,
    });

    const responseText = chatCompletion.choices[0]?.message?.content?.trim() || "";
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
    console.error('Groq intelligence extraction failed:', error);
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

  const apiKey = getGroqApiKey();
  if (!apiKey) return "You've been busy sharing memories lately!";

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const memoryFeed = memories.map(m => m.raw_text).join('\n');
    const prompt = `Create a "Weekly Life Recap" for an elderly person based on these memories:
${memoryFeed}

Tone: Warm, celebratory, dignified.
Length: 3-4 short sentences.
Focus: On what they've been talking about most and positive highlights.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.8,
      max_tokens: 500,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || "You've shared some wonderful moments this week!";
  } catch (error) {
    return "You've shared some wonderful moments this week!";
  }
}

/**
 * Generate an adaptive follow-up question to keep the conversation going
 */
export async function generateAdaptiveQuestion(rawText: string, elderId: string): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return "That's lovely. Could you tell me more about it?";

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const prompt = `Based on this shared memory: "${rawText}", ask ONE warm, engaging follow-up question that helps the person recall more details or feelings. Keep it very short and senior-friendly. Don't be intrusive.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.8,
      max_tokens: 100,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || "Tell me more about that moment.";
  } catch (error) {
    return "Could you tell me more about it?";
  }
}

/**
 * Generate a detailed summary for the caregiver
 */
export async function generateCaregiverDailySummary(elderId: string): Promise<string> {
  const today = new Date();
  today.setHours(0,0,0,0);

  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('elder_id', elderId)
    .gte('created_at', today.toISOString());

  const { data: signals } = await supabase
    .from('behavioral_signals')
    .select('*')
    .eq('elder_id', elderId)
    .gte('created_at', today.toISOString());

  if (!memories?.length && !signals?.length) return "No activity recorded today.";

  const apiKey = getGroqApiKey();
  if (!apiKey) return "Activity recorded. Please check logs.";

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const content = `
    Memories: ${memories?.map(m => m.raw_text).join('\n')}
    Anomalies/Signals: ${signals?.map(s => s.description).join('\n')}
    `;

    const prompt = `Act as a professional geriatric care assistant. Summarize today's interactions for the caregiver.
    In 2-3 bullet points, highlight:
    1. Overall mood and cognitive clarity.
    2. Key memories shared.
    3. Any concerns (repeated questions, confusion).
    Keep it professional and concise.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
        {
          role: "system",
          content: content
        }
      ],
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 500,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || "Summary compiled in logs.";
  } catch (error) {
    return "Summary generated. Please review interaction logs.";
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

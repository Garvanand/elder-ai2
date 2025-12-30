import { supabase } from '@/lib/supabase';
import type { Memory } from '@/types';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface AnswerResponse {
  answer: string;
  matchedMemories: Memory[];
}

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

  if (GROQ_API_KEY && memories && memories.length > 0) {
    try {
      const memoryContext = memories.slice(0, 15).map((m, i) => 
        `Memory ${i + 1} [${m.type}]: ${m.raw_text}`
      ).join('\n');
      
      const prompt = `You are a warm, dignified memory assistant for an elderly person. Answer their question using ONLY the memories provided below. Be caring, clear, and helpful.

Question: "${question}"

Memories:
${memoryContext}

Provide a warm, helpful answer in 2-3 sentences. If you can't find relevant information, say so kindly.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 200,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content?.trim() || "";
        
        return {
          answer,
          matchedMemories: matchMemoriesByKeyword(question, memories as Memory[]).slice(0, 3),
        };
      }
    } catch (error) {
      console.warn('Groq API failed:', error);
    }
  }

  if (memories && memories.length > 0) {
    const matched = matchMemoriesByKeyword(question, memories as Memory[]);
    if (matched.length > 0) {
      return {
        answer: `Based on your memories, here's what I found:\n\n${matched.slice(0, 3).map(m => `• ${m.raw_text}`).join('\n')}`,
        matchedMemories: matched.slice(0, 3),
      };
    }
    return {
      answer: "I couldn't find specific memories related to your question. Would you like to add more memories or try asking in a different way?",
      matchedMemories: [],
    };
  }

  return {
    answer: "I don't have any memories stored yet. Try adding some memories first, and then I can help you remember!",
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
  if (!GROQ_API_KEY) {
    return { type: 'story', tags: [], emotional_tone: 'neutral', confidence_score: 0.5, structured: {} };
  }

  try {
    const prompt = `Extract intelligence from this memory text: "${rawText}". 
Return ONLY a JSON object with these fields:
{
  "type": "story|person|event|medication|preference",
  "emotional_tone": "happy|nostalgic|confused|sad|neutral",
  "tags": ["relevant", "keywords"],
  "structured": {}
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      return {
        type: parsed.type || 'story',
        tags: parsed.tags || [],
        emotional_tone: parsed.emotional_tone || 'neutral',
        confidence_score: 0.9,
        structured: parsed.structured || {},
      };
    }
  } catch (error) {
    console.warn('Memory extraction failed:', error);
  }

  return { type: 'story', tags: [], emotional_tone: 'neutral', confidence_score: 0.5, structured: {} };
}

export function matchMemoriesByKeyword(question: string, memories: Memory[]): Memory[] {
  const keywords = question
    .toLowerCase()
    .replace(/[?.,!]/g, '')
    .split(' ')
    .filter(word => word.length > 3);
    
  return memories.filter(m => {
    const text = m.raw_text.toLowerCase();
    return keywords.some(k => 
      text.includes(k) || 
      (m.tags || []).some(t => t.toLowerCase().includes(k))
    );
  });
}

export async function generateWeeklyRecap(elderId: string): Promise<string> {
  if (!GROQ_API_KEY) {
    return "You've had a wonderful week full of meaningful moments and engagement.";
  }

  try {
    const { data: memories } = await supabase
      .from('memories')
      .select('raw_text')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: false })
      .limit(20);

    const context = memories?.map(m => m.raw_text).join('\n') || "No recent memories.";
    
    const prompt = `Generate a warm, dignified 2-sentence summary of the elder's week based on these memories: ${context}. Focus on positive highlights and emotional connection. Use "You" to address the elder.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 150,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "You've shared some beautiful stories this week.";
    }
  } catch (error) {
    console.warn('Weekly recap failed:', error);
  }

  return "It's been a week full of precious memories and connections.";
}

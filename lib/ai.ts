/**
 * AI Module for Memory Processing
 * 
 * This module contains AI-related functions for memory extraction,
 * question answering, and summary generation.
 * 
 * Functions can use Gemini API if GEMINI_API_KEY is set,
 * otherwise fall back to naive implementations.
 */

import type { Memory } from '../src/types';
import { Groq } from 'groq-sdk';

/**
 * Keywords to detect in memory text for naive tag extraction
 */
const COMMON_OBJECT_KEYWORDS = ['keys', 'wallet', 'glasses', 'phone', 'medication', 'medicine', 'pill'];

/**
 * Structured memory data extracted from text
 */
export interface StructuredMemory {
  structured: {
    objects?: string[];
    locations?: string[];
    people?: string[];
    [key: string]: unknown;
  };
  tags: string[];
}

/**
 * Answer response with matched memories
 */
export interface AnswerResult {
  answer: string;
  matchedMemories: Memory[];
}

/**
 * Extract structured data and tags from memory text
 * 
 * If GEMINI_API_KEY is set, uses Gemini API to extract:
 * - Objects mentioned
 * - Locations mentioned
 * - People mentioned
 * 
 * Otherwise uses naive keyword matching.
 */
export async function extractStructuredMemory(
  text: string,
  type: string
): Promise<StructuredMemory> {
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey) {
    return extractStructuredMemoryWithGroq(text, type, apiKey);
  }

  return extractStructuredMemoryNaive(text);
}

/**
 * Naive implementation: simple keyword matching
 */
function extractStructuredMemoryNaive(text: string): StructuredMemory {
  const lowerText = text.toLowerCase();
  const tags: string[] = [];

  // Check for common object keywords
  for (const keyword of COMMON_OBJECT_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      tags.push(keyword);
    }
  }

  return {
    structured: {},
    tags,
  };
}

/**
 * Groq API implementation for structured memory extraction
 */
async function extractStructuredMemoryWithGroq(
  text: string,
  type: string,
  apiKey: string
): Promise<StructuredMemory> {
  try {
    const groq = new Groq({ apiKey });

    const prompt = `Analyze the following memory text and extract structured information. The memory type is: ${type}

Memory text: "${text}"

Extract the following information:
1. Objects mentioned (keys, wallet, glasses, medications, etc.)
2. Locations mentioned (places, addresses, rooms, etc.)
3. People mentioned (names, relationships, etc.)

Return ONLY a valid JSON object with this exact structure:
{
  "objects": ["object1", "object2"],
  "locations": ["location1", "location2"],
  "people": ["person1", "person2"],
  "tags": ["tag1", "tag2", "tag3"]
}

The tags should be relevant keywords that help categorize this memory. Include the memory type "${type}" as a tag.
Return only the JSON, no additional text.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
    });

    const responseText = chatCompletion.choices[0]?.message?.content?.trim() || "";
    let jsonText = responseText;
    if (responseText.startsWith('```')) {
      jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const parsed = JSON.parse(jsonText);

    return {
      structured: {
        objects: parsed.objects || [],
        locations: parsed.locations || [],
        people: parsed.people || [],
      },
      tags: parsed.tags || [],
    };
  } catch (error) {
    console.error('Error calling Groq API for memory extraction:', error);
    return extractStructuredMemoryNaive(text);
  }
}

/**
 * Answer a question using the elder's memories as context
 * 
 * If GEMINI_API_KEY is set, uses Gemini to find the top 3 most relevant memories.
 * Otherwise uses simple keyword matching.
 */
export async function answerQuestionFromMemories(
  question: string,
  memories: Memory[]
): Promise<AnswerResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey && memories.length > 0) {
    return answerQuestionWithGroq(question, memories, apiKey);
  }

  return answerQuestionNaive(question, memories);
}

/**
 * Naive implementation: keyword matching
 */
function answerQuestionNaive(question: string, memories: Memory[]): AnswerResult {
  const questionLower = question.toLowerCase();
  const keywords = questionLower
    .replace(/[?.,!]/g, '')
    .split(' ')
    .filter(word => word.length > 3);

  // Find memories that contain any keyword
  const matchedMemories = memories.filter(memory => {
    const text = memory.raw_text.toLowerCase();
    const tags = (memory.tags || []).map(t => t.toLowerCase());
    
    return keywords.some(keyword => 
      text.includes(keyword) || tags.some(tag => tag.includes(keyword))
    );
  });

  // Sort by created_at descending and take the latest
  const sortedMemories = matchedMemories.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const latestMemory = sortedMemories[0];

  if (!latestMemory) {
    return {
      answer: "I don't have any memories that match your question. Would you like to share a memory about this?",
      matchedMemories: [],
    };
  }

  const answer = `Last time you mentioned this was: ${latestMemory.raw_text}`;
  
  return {
    answer,
    matchedMemories: [latestMemory],
  };
}

/**
 * Groq API implementation for question answering
 */
async function answerQuestionWithGroq(
  question: string,
  memories: Memory[],
  apiKey: string
): Promise<AnswerResult> {
  try {
    const groq = new Groq({ apiKey });

    // Format memories for context
    const memoryContext = memories
      .map((m, i) => `Memory ${i + 1} (${m.type}, ${new Date(m.created_at).toLocaleDateString()}): ${m.raw_text}`)
      .join('\n\n');

    const prompt = `You are a warm, patient, and caring memory assistant for elderly users. Answer the following question using the provided memories as context.

Question: "${question}"

Available memories:
${memoryContext}

Instructions:
1. Find the top 3 most relevant memories that relate to the question
2. Use these memories to provide a warm, friendly, and reassuring answer
3. Use simple, clear language appropriate for elderly users
4. If no relevant memories exist, gently explain that and offer to help record new memories
5. Keep your response concise but complete (3-5 sentences)
6. Be encouraging and positive

After your answer, list the memory numbers (1, 2, 3, etc.) that you used, separated by commas. Format your response as:
ANSWER: [your answer here]
MEMORIES: [comma-separated memory numbers]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
    });

    const responseText = chatCompletion.choices[0]?.message?.content?.trim() || "";

    // Parse response
    const answerMatch = responseText.match(/ANSWER:\s*(.+?)(?=MEMORIES:|$)/is);
    const memoriesMatch = responseText.match(/MEMORIES:\s*(.+?)$/is);

    let answer = answerMatch ? answerMatch[1].trim() : responseText;
    const memoryIndices = memoriesMatch 
      ? memoriesMatch[1].split(',').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < memories.length)
      : [];

    // Get matched memories (top 3, or all if less than 3)
    const matchedMemories = memoryIndices
      .slice(0, 3)
      .map(idx => memories[idx])
      .filter(Boolean);

    // If no memories matched, fall back to naive approach
    if (matchedMemories.length === 0) {
      return answerQuestionNaive(question, memories);
    }

    return {
      answer,
      matchedMemories,
    };
  } catch (error) {
    console.error('Error calling Groq API for question answering:', error);
    // Fall back to naive implementation
    return answerQuestionNaive(question, memories);
  }
}

/**
 * Generate a daily summary from memories
 * 
 * If GROQ_API_KEY is set, uses Groq to generate a 3-5 sentence summary.
 * Otherwise creates a simple bullet-point list.
 */
export async function generateDailySummary(memories: Memory[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey && memories.length > 0) {
    return generateDailySummaryWithGroq(memories, apiKey);
  }

  return generateDailySummaryNaive(memories);
}

/**
 * Naive implementation: simple bullet points
 */
function generateDailySummaryNaive(memories: Memory[]): string {
  if (memories.length === 0) {
    return 'No memories recorded today.';
  }

  const summaries = memories.map((memory, index) => {
    const shortText = memory.raw_text.length > 100 
      ? memory.raw_text.substring(0, 100) + '...'
      : memory.raw_text;
    return `${index + 1}. ${shortText}`;
  });

  return summaries.join('\n');
}

/**
 * Groq API implementation for daily summary generation
 */
async function generateDailySummaryWithGroq(
  memories: Memory[],
  apiKey: string
): Promise<string> {
  try {
    const groq = new Groq({ apiKey });

    // Format memories for context
    const memoryList = memories
      .map((m, i) => `${i + 1}. [${m.type}] ${m.raw_text}`)
      .join('\n');

    const prompt = `You are a memory assistant creating a daily summary for an elderly user. Generate a warm, friendly, and easy-to-understand summary of their day based on the following memories.

Memories from today:
${memoryList}

Instructions:
1. Create a 3-5 sentence summary in simple, clear language
2. Use warm and encouraging tone
3. Highlight the most important or meaningful moments
4. Group related memories together naturally
5. Make it feel personal and caring
6. Use language appropriate for elderly users (avoid complex sentences)

Return only the summary text, no additional formatting or labels.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error('Error calling Groq API for summary generation:', error);
    // Fall back to naive implementation
    return generateDailySummaryNaive(memories);
  }
}


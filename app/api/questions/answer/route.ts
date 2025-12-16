/**
 * Questions Answer API Route
 * 
 * Handles POST requests to answer questions using elder's memories.
 */

import { NextRequest, NextResponse } from "next/server"
import { supabase, buildMemoryQuery } from "@/lib/db"
import { answerQuestionFromMemories } from "@/lib/ai"
import type { Memory } from "@/src/types"

interface AnswerQuestionRequest {
  question: string
  elderId: string
}

/**
 * Validates the answer question request body
 */
function validateAnswerRequest(body: unknown): body is AnswerQuestionRequest {
  if (typeof body !== "object" || body === null) {
    return false
  }

  const req = body as Record<string, unknown>

  const question = typeof req.question === "string" ? req.question.trim() : ""
  return (
    typeof req.elderId === "string" &&
    req.elderId.length > 0 &&
    typeof req.question === "string" &&
    question.length > 0 &&
    question.length <= 500
  )
}

/**
 * POST /api/questions/answer
 * Answers a question using the elder's memories
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!validateAnswerRequest(body)) {
      return NextResponse.json(
        { error: "Invalid body: elderId and a non-empty question (max 500 characters) are required" },
        { status: 400 }
      )
    }

    const { question, elderId } = body

    // Fetch elder's memories
    const { data: memories, error: memoriesError } = await buildMemoryQuery()
      .select("*")
      .eq("elder_id", elderId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (memoriesError) {
      console.error("Error fetching memories:", memoriesError)
      return NextResponse.json(
        { error: "Failed to fetch memories", details: memoriesError.message },
        { status: 500 }
      )
    }

    // Convert database memories to Memory type
    const typedMemories: Memory[] = (memories || []).map((m) => ({
      id: m.id,
      elder_id: m.elder_id,
      type: m.type,
      raw_text: m.raw_text,
      structured_json: (m.structured_json as Record<string, unknown>) || {},
      tags: m.tags || [],
      created_at: m.created_at,
      updated_at: m.updated_at,
    }))

    // Answer the question using AI
    const result = await answerQuestionFromMemories(question.trim(), typedMemories)

    // Store the question and answer in the database
    const { error: insertError } = await supabase.from("questions").insert({
      elder_id: elderId,
      question_text: question.trim(),
      answer_text: result.answer,
      matched_memory_ids: result.matchedMemories.map((m) => m.id),
    })

    if (insertError) {
      console.error("Error storing question:", insertError)
      // Don't fail the request if storage fails, just log it
    }

    return NextResponse.json({
      answer: result.answer,
      matchedMemories: result.matchedMemories,
    })
  } catch (error) {
    console.error("Error in POST /api/questions/answer:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}


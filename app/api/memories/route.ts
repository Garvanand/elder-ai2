/**
 * Memories API Route
 * 
 * Handles POST and GET requests for the memories resource.
 * POST: Create a new memory
 * GET: Fetch memories with optional filters (elderId, type, tag)
 */

import { NextRequest, NextResponse } from "next/server"
import { buildMemoryQuery } from "@/lib/db"
import type { MemoryType } from "@/src/types"

interface CreateMemoryRequest {
  elderId: string
  type: MemoryType
  text: string
  imageUrl?: string | null
}

/**
 * Validates the create memory request body
 */
function validateCreateRequest(body: unknown): body is CreateMemoryRequest {
  if (typeof body !== "object" || body === null) {
    return false
  }

  const req = body as Record<string, unknown>

  const text = typeof req.text === "string" ? req.text.trim() : ""
  const type = req.type as MemoryType | undefined
  const allowedTypes: MemoryType[] = ["story", "person", "event", "medication", "routine", "preference", "other"]

  return (
    typeof req.elderId === "string" &&
    req.elderId.length > 0 &&
    typeof req.type === "string" &&
    allowedTypes.includes(type as MemoryType) &&
    typeof req.text === "string" &&
    text.length > 0 &&
    text.length <= 5000
  )
}

/**
 * POST /api/memories
 * Creates a new memory
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!validateCreateRequest(body)) {
      return NextResponse.json(
        {
          error:
            "Invalid body: elderId, a valid memory type, and non-empty text (max 5000 characters) are required.",
        },
        { status: 400 }
      )
    }

    const { elderId, type, text, imageUrl } = body

    // Insert memory into database
    const { data, error } = await buildMemoryQuery()
      .insert({
        elder_id: elderId,
        type: type,
        raw_text: text.trim(),
        structured_json: null,
        tags: [],
        image_url: imageUrl ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating memory:", error)
      return NextResponse.json(
        { error: "Failed to create memory", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/memories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET /api/memories
 * Fetches memories with optional filters
 * Query params: elderId (required), type (optional), tag (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const elderId = searchParams.get("elderId")
    const type = searchParams.get("type")
    const tag = searchParams.get("tag")
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 50

    // Validate required query param
    if (!elderId) {
      return NextResponse.json(
        { error: "elderId query parameter is required" },
        { status: 400 }
      )
    }

    if (isNaN(limit) || limit < 1 || limit > 200) {
      return NextResponse.json(
        { error: "limit must be a number between 1 and 200" },
        { status: 400 }
      )
    }

    // Build query
    let query = buildMemoryQuery().select("*").eq("elder_id", elderId).order("created_at", { ascending: false }).limit(limit)

    // Apply optional filters
    if (type) {
      query = query.eq("type", type)
    }

    if (tag) {
      query = query.contains("tags", [tag])
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching memories:", error)
      return NextResponse.json(
        { error: "Failed to fetch memories", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET /api/memories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


/**
 * Memories API Route - Optimized
 */

import { NextRequest, NextResponse } from "next/server"
import { supabase, buildMemoryQuery } from "@/lib/db"
import type { MemoryType } from "@/src/types"

interface CreateMemoryRequest {
  elderId: string
  type: MemoryType
  text: string
  imageUrl?: string | null
  tags?: string[]
  emotionalTone?: string
}

const ALLOWED_TYPES: MemoryType[] = ["story", "person", "event", "medication", "routine", "preference", "other"]

function validateCreateRequest(body: unknown): body is CreateMemoryRequest {
  if (typeof body !== "object" || body === null) return false

  const req = body as Record<string, unknown>
  const text = typeof req.text === "string" ? req.text.trim() : ""
  const type = req.type as MemoryType | undefined

  return (
    typeof req.elderId === "string" &&
    req.elderId.length > 0 &&
    typeof req.type === "string" &&
    ALLOWED_TYPES.includes(type as MemoryType) &&
    typeof req.text === "string" &&
    text.length > 0 &&
    text.length <= 5000
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!validateCreateRequest(body)) {
      return NextResponse.json(
        { error: "Invalid body: elderId, valid type, and non-empty text (max 5000 chars) required." },
        { status: 400 }
      )
    }

    const { elderId, type, text, imageUrl, tags, emotionalTone } = body

    const { data, error } = await buildMemoryQuery()
      .insert({
        elder_id: elderId,
        type: type,
        raw_text: text.trim(),
        structured_json: null,
        tags: tags || [],
        image_url: imageUrl ?? null,
        emotional_tone: emotionalTone || 'neutral',
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const elderId = searchParams.get("elderId")
    const type = searchParams.get("type")
    const tag = searchParams.get("tag")
    const search = searchParams.get("search")
    const limitParam = searchParams.get("limit")
    const offsetParam = searchParams.get("offset")
    
    const limit = Math.min(Math.max(parseInt(limitParam || "50", 10) || 50, 1), 200)
    const offset = Math.max(parseInt(offsetParam || "0", 10) || 0, 0)

    if (!elderId) {
      return NextResponse.json(
        { error: "elderId query parameter is required" },
        { status: 400 }
      )
    }

    let query = buildMemoryQuery()
      .select("id, elder_id, type, raw_text, tags, image_url, emotional_tone, created_at, updated_at")
      .eq("elder_id", elderId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (type && ALLOWED_TYPES.includes(type as MemoryType)) {
      query = query.eq("type", type)
    }

    if (tag) {
      query = query.contains("tags", [tag])
    }

    if (search) {
      query = query.ilike("raw_text", `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching memories:", error)
      return NextResponse.json(
        { error: "Failed to fetch memories", details: error.message },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      data: data || [],
      pagination: { limit, offset, total: count }
    })
    
    response.headers.set('Cache-Control', 'private, max-age=30')
    return response
  } catch (error) {
    console.error("Error in GET /api/memories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

"use client"

import type { Memory } from "@/src/types"
import { Calendar, Image as ImageIcon, MapPin, Tag } from "lucide-react"
import { format } from "date-fns"

interface MemoryTimelineProps {
  memories: Memory[]
}

export function MemoryTimeline({ memories }: MemoryTimelineProps) {
  if (memories.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
        <p className="text-muted-foreground">No memories captured yet.</p>
      </div>
    )
  }

  // Sort memories by date descending
  const sortedMemories = [...memories].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {sortedMemories.map((memory, index) => (
        <div key={memory.id} className="relative flex items-start ml-12 group">
          {/* Timeline dot */}
          <div className="absolute -left-12 mt-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background ring-4 ring-background transition-transform group-hover:scale-125" />
          
          <div className="flex-1 bg-card border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {format(new Date(memory.created_at), "PPP")}
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize">
                {memory.type}
              </span>
            </div>

            {memory.image_url && (
              <div className="mb-4 overflow-hidden rounded-xl border">
                <img
                  src={memory.image_url}
                  alt="Memory visual"
                  className="w-full aspect-video object-cover transition-transform hover:scale-105"
                />
              </div>
            )}

            <p className="text-foreground leading-relaxed mb-4">{memory.raw_text}</p>

            {memory.tags && memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-xs text-muted-foreground"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Structured data hints if available */}
            {memory.structured_json && (memory.structured_json as any).location && (
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {(memory.structured_json as any).location}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

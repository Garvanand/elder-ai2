"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, AlertCircle } from "lucide-react"
import { createMemory, getElderId } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { MemoryType } from "@/src/types"

type ComponentMemoryType = "object" | "event" | "reminder" | "other"

/**
 * Maps component memory types to database memory types
 */
function mapMemoryType(type: ComponentMemoryType | undefined): MemoryType {
  const mapping: Record<ComponentMemoryType, MemoryType> = {
    object: "other",
    event: "event",
    reminder: "routine",
    other: "other",
  }
  return type ? mapping[type] : "other"
}

interface MemoryFormProps {
  onSuccess?: () => void
}

export function MemoryForm({ onSuccess }: MemoryFormProps) {
  const [text, setText] = useState("")
  const [type, setType] = useState<ComponentMemoryType | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const elderId = getElderId()
      const dbType = mapMemoryType(type)
      
      await createMemory(elderId, dbType, text.trim())
      
      // Clear form on success
      setText("")
      setType(undefined)
      
      // Show success message
      toast({
        title: "Memory saved!",
        description: "Your memory has been successfully saved.",
      })
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save memory. Please try again."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8">
      {/* Memory Text Input */}
      <div className="space-y-3">
        <Label htmlFor="memory-text" className="text-xl md:text-2xl font-medium text-foreground">
          What would you like to remember?
        </Label>
        <Textarea
          id="memory-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your memory here..."
          className="min-h-[160px] text-lg md:text-xl p-4 resize-none"
          aria-describedby="memory-hint"
          required
        />
        <p id="memory-hint" className="text-base text-muted-foreground">
          Write anything you want to remember - a name, a place, an event, or a reminder.
        </p>
      </div>

      {/* Optional Type Dropdown */}
      <div className="space-y-3">
        <Label htmlFor="memory-type" className="text-lg md:text-xl font-medium text-foreground">
          Type <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Select value={type} onValueChange={(value: MemoryType) => setType(value)}>
          <SelectTrigger id="memory-type" className="h-14 text-lg">
            <SelectValue placeholder="Select a type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="object" className="text-lg py-3">
              Object
            </SelectItem>
            <SelectItem value="event" className="text-lg py-3">
              Event
            </SelectItem>
            <SelectItem value="reminder" className="text-lg py-3">
              Reminder
            </SelectItem>
            <SelectItem value="other" className="text-lg py-3">
              Other
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-base">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-16 text-xl md:text-2xl font-semibold gap-3"
        disabled={!text.trim() || isLoading}
        aria-label={isLoading ? "Saving memory..." : "Save this memory"}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-6 w-6" aria-hidden="true" />
            Save Memory
          </>
        )}
      </Button>
    </form>
  )
}

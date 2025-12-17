"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, AlertCircle, Mic, Square, Upload } from "lucide-react"
import { createMemory, getElderContext, uploadMemoryImage } from "@/lib/api"
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

const MAX_TEXT_LENGTH = 5000
const MAX_IMAGE_SIZE_MB = 5
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

export function MemoryForm({ onSuccess }: MemoryFormProps) {
  const [text, setText] = useState("")
  const [type, setType] = useState<ComponentMemoryType | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { toast } = useToast()

  // Initialize SpeechRecognition if available
  useEffect(() => {
    if (typeof window === "undefined") return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition: SpeechRecognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }
    recognition.onerror = () => {
      setIsListening(false)
      toast({
        title: "Voice input error",
        description: "Sorry, I couldn't understand that. Please try again.",
        variant: "destructive",
      })
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
  }, [toast])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice input not supported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
      })
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch {
        setIsListening(false)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      // Validate file size
      if (selected.size > MAX_IMAGE_SIZE_BYTES) {
        toast({
          title: "File too large",
          description: `Please choose an image smaller than ${MAX_IMAGE_SIZE_MB}MB.`,
          variant: "destructive",
        })
        e.target.value = ""
        return
      }
      // Validate file type
      if (!selected.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please choose an image file.",
          variant: "destructive",
        })
        e.target.value = ""
        return
      }
      setFile(selected)
      setError(null)
    } else {
      setFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    const trimmedText = text.trim()
    if (!trimmedText) {
      setError("Please enter some text for your memory.")
      return
    }
    
    if (trimmedText.length > MAX_TEXT_LENGTH) {
      setError(`Memory text is too long. Please keep it under ${MAX_TEXT_LENGTH} characters.`)
      return
    }
    
    if (isLoading) return

    setIsLoading(true)
    setError(null)
    setUploadProgress(null)

    try {
      const context = await getElderContext()
      if (!context.elderId) {
        throw new Error("No elder selected. Please sign in again or ask a caregiver to link you.")
      }
      const dbType = mapMemoryType(type)
      let imageUrl: string | null = null

      if (file) {
        setUploadProgress(0)
        try {
          imageUrl = await uploadMemoryImage(file, context.elderId)
          setUploadProgress(100)
        } catch (uploadErr) {
          throw new Error(
            uploadErr instanceof Error
              ? `Image upload failed: ${uploadErr.message}`
              : "Failed to upload image. Please try again."
          )
        }
      }
      
      await createMemory(context.elderId, dbType, trimmedText, imageUrl)
      
      // Clear form on success
      setText("")
      setType(undefined)
      setFile(null)
      setUploadProgress(null)
      
      // Show success message with animation
      toast({
        title: "Memory saved! ✨",
        description: "Your memory has been successfully saved.",
      })
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save memory. Please try again."
      setError(errorMessage)
      setUploadProgress(null)
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
          onChange={(e) => {
            setText(e.target.value)
            setError(null)
          }}
          placeholder="Type your memory here..."
          className="min-h-[160px] text-lg md:text-xl p-4 resize-none"
          aria-describedby="memory-hint"
          maxLength={MAX_TEXT_LENGTH}
          required
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{text.length} / {MAX_TEXT_LENGTH} characters</span>
          {text.length > MAX_TEXT_LENGTH * 0.9 && (
            <span className="text-amber-600">Getting close to limit</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={isListening ? "secondary" : "outline"}
            size="sm"
            onClick={toggleListening}
            aria-pressed={isListening}
            className="gap-2"
          >
            {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="text-sm">{isListening ? "Listening..." : "🎤 Voice input"}</span>
          </Button>
          {isListening && <span className="text-sm text-muted-foreground">Speak now...</span>}
        </div>
        <p id="memory-hint" className="text-base text-muted-foreground">
          Write anything you want to remember - a name, a place, an event, or a reminder.
        </p>
      </div>

      {/* Image upload */}
      <div className="space-y-3">
        <Label htmlFor="memory-image" className="text-lg md:text-xl font-medium text-foreground">
          Add an image <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="flex items-center gap-3">
          <input
            id="memory-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />
          {file && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Upload className="h-4 w-4" />
                {file.name}
              </span>
              <span className="text-xs text-muted-foreground">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              {uploadProgress !== null && uploadProgress < 100 && (
                <div className="flex-1 max-w-xs">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Images help caregivers see the memory context. Max size: {MAX_IMAGE_SIZE_MB}MB
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

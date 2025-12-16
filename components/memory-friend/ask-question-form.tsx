"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Loader2, AlertCircle, Volume2 } from "lucide-react"
import { answerQuestion, getElderContext } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface AskQuestionFormProps {
  onSuccess?: () => void
}

export function AskQuestionForm({ onSuccess }: AskQuestionFormProps) {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const speechSupported = useMemo(
    () => typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined",
    []
  )

  // Read answer aloud when it changes
  useEffect(() => {
    if (!speechSupported || !answer) return
    const utterance = new SpeechSynthesisUtterance(answer)
    utterance.rate = 0.85
    utterance.pitch = 1
    utterance.volume = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }, [answer, speechSupported])

  const speakAnswer = () => {
    if (!speechSupported || !answer) {
      toast({
        title: "Audio not available",
        description: "Your browser does not support text-to-speech.",
        variant: "destructive",
      })
      return
    }
    const utterance = new SpeechSynthesisUtterance(answer)
    utterance.rate = 0.85
    utterance.pitch = 1
    utterance.volume = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    setAnswer(null)
    setError(null)

    try {
      const context = await getElderContext()
      if (!context.elderId) {
        throw new Error("No elder selected. Please sign in again or ask a caregiver to link you.")
      }
      const result = await answerQuestion(context.elderId, question.trim())
      setAnswer(result.answer)
      
      // Show success message
      toast({
        title: "Answer found!",
        description: "I found an answer based on your memories.",
      })
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sorry, I couldn't find an answer. Please try again."
      setError(errorMessage)
      setAnswer(null)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewQuestion = () => {
    setQuestion("")
    setAnswer(null)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Input */}
        <div className="space-y-3">
          <Label htmlFor="question-input" className="text-xl md:text-2xl font-medium text-foreground">
            What would you like to ask?
          </Label>
          <Input
            id="question-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="h-16 text-lg md:text-xl px-4"
            disabled={isLoading}
            aria-describedby="question-hint"
            required
          />
          <p id="question-hint" className="text-base text-muted-foreground">
            Ask about anything you've saved - names, places, events, or reminders.
          </p>
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
          disabled={!question.trim() || isLoading}
          aria-label={isLoading ? "Finding answer..." : "Ask this question"}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              Finding answer...
            </>
          ) : (
            <>
              <Send className="h-6 w-6" aria-hidden="true" />
              Ask Question
            </>
          )}
        </Button>
      </form>

      {/* Loading State */}
      {isLoading && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
            <p className="text-xl text-foreground text-center">Looking through your memories...</p>
          </CardContent>
        </Card>
      )}

      {/* Answer Display */}
      {answer && !isLoading && (
        <Card className="border-2 border-primary">
          <CardContent className="p-8">
            <h2 className="text-lg font-semibold text-muted-foreground mb-3">Answer</h2>
            <p className="text-xl md:text-2xl text-foreground leading-relaxed">{answer}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="h-12 text-lg bg-transparent gap-2"
                onClick={speakAnswer}
                aria-label="Read answer aloud"
              >
                <Volume2 className="h-5 w-5" />
                🔊 Read aloud
              </Button>
              <Button
                onClick={handleNewQuestion}
                variant="outline"
                size="lg"
                className="h-12 text-lg bg-transparent"
              >
                Ask another question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

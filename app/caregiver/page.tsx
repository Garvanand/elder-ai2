"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"
import {
  getElderId,
  getMemories,
  getQuestions,
  getRecentSummaries,
  generateDailySummaryApi,
} from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { Memory, Question, DailySummary } from "@/src/types"

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function CaregiverPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [summaries, setSummaries] = useState<DailySummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const elderId = getElderId()

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [memData, qData, sData] = await Promise.all([
        getMemories(elderId, { limit: 20 }).catch(() => []),
        getQuestions(elderId, 10).catch(() => []),
        getRecentSummaries(elderId, 7).catch(() => []),
      ])
      setMemories(memData)
      setQuestions(qData)
      setSummaries(sData)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load caregiver data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerateToday = async () => {
    setIsGenerating(true)
    try {
      await generateDailySummaryApi(elderId)
      toast({
        title: "Summary generated",
        description: "Today’s summary has been created.",
      })
      const refreshed = await getRecentSummaries(elderId, 7)
      setSummaries(refreshed)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate summary",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Caregiver Dashboard</h1>
          <p className="text-muted-foreground mt-1">Elder ID: {elderId}</p>
        </div>
        <Button onClick={handleGenerateToday} disabled={isGenerating} className="gap-2">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Generate today’s summary
        </Button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading data...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Memories Timeline */}
          <section className="space-y-3">
            <Card className="border">
              <CardHeader>
                <CardTitle>Recent Memories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {memories.length === 0 ? (
                  <p className="text-muted-foreground">No memories available.</p>
                ) : (
                  memories.map((m) => (
                    <div key={m.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                      {m.image_url && (
                        <img
                          src={m.image_url}
                          alt="Memory"
                          className="w-full max-h-40 object-cover rounded mb-2 border"
                        />
                      )}
                      <p className="text-foreground">{m.raw_text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(m.created_at)} at {formatTime(m.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          {/* Right column */}
          <section className="space-y-6">
            <Card className="border">
              <CardHeader>
                <CardTitle>Recent Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questions.length === 0 ? (
                  <p className="text-muted-foreground">No questions available.</p>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                      <p className="font-medium text-foreground">{q.question_text}</p>
                      {q.answer_text && <p className="text-sm text-muted-foreground mt-1">{q.answer_text}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(q.created_at)} at {formatTime(q.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader>
                <CardTitle>Recent Summaries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summaries.length === 0 ? (
                  <p className="text-muted-foreground">No summaries yet.</p>
                ) : (
                  summaries.map((s) => (
                    <div key={s.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                      <p className="text-sm text-muted-foreground mb-1">{formatDate(s.date)}</p>
                      <p className="text-foreground text-sm">
                        {s.summary_text.length > 120 ? `${s.summary_text.slice(0, 120)}...` : s.summary_text}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, RefreshCw, ChevronDown, ChevronUp, Download, Users, History, MessageSquare, PieChart, Brain } from "lucide-react"
import {
  getElderContext,
  getMemories,
  getQuestions,
  getRecentSummaries,
  generateDailySummaryApi,
  linkElderByEmail,
} from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { AppHeader } from "@/components/memory-friend/app-header"
import { MemoryTimeline } from "@/components/memory-friend/memory-timeline"
import { CaregiverInsights } from "@/components/memory-friend/caregiver-insights"
import { supabase } from "../../src/integrations/supabase/client"
import type { Memory, Question, DailySummary } from "@/src/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DEV_BYPASS_AUTH = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true"

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
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(!DEV_BYPASS_AUTH)
  const [elderId, setElderId] = useState<string | null>(null)
  const [linkEmail, setLinkEmail] = useState("")
  const [linking, setLinking] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [role, setRole] = useState<"elder" | "caregiver" | null>(null)
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  
  const toggleSummary = (summaryId: string) => {
    setExpandedSummaries((prev) => {
      const next = new Set(prev)
      if (next.has(summaryId)) {
        next.delete(summaryId)
      } else {
        next.add(summaryId)
      }
      return next
    })
  }

  const handleDownloadSummary = (summary: DailySummary) => {
    const content = `Date: ${formatDate(summary.date)}\nElder ID: ${summary.elder_id}\n\nSummary:\n${summary.summary_text}\n`
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `memoryfriend-summary-${summary.date}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      setAuthLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const context = await getElderContext()
      if (!context.elderId) {
        setIsLoading(false)
        return
      }
      setElderId(context.elderId)

      const [memData, qData, sData] = await Promise.all([
        getMemories(context.elderId, { limit: 50 }).catch(() => []),
        getQuestions(context.elderId, 20).catch(() => []),
        getRecentSummaries(context.elderId, 14).catch(() => []),
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
    getElderContext().then((ctx) => {
      setUserName(ctx.userName || null)
      setRole(ctx.role)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerateToday = async () => {
    if (!elderId) return
    setIsGenerating(true)
    try {
      await generateDailySummaryApi(elderId)
      toast({
        title: "Summary generated",
        description: "Today’s summary has been created.",
      })
      const refreshed = await getRecentSummaries(elderId, 14)
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

  const handleLinkElder = async () => {
    if (!linkEmail.trim()) return
    setLinking(true)
    try {
      await linkElderByEmail(linkEmail.trim())
      toast({
        title: "Linked",
        description: "The elder has been linked to your caregiver account.",
      })
      setLinkEmail("")
      await loadData()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to link elder",
        variant: "destructive",
      })
    } finally {
      setLinking(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user && !DEV_BYPASS_AUTH) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>Please sign in to access the caregiver dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/auth'}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <AppHeader userName={userName || "Caregiver"} role={role || "caregiver"} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {DEV_BYPASS_AUTH && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            DEV MODE: Authentication bypassed
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Caregiver Dashboard</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Monitoring activity for <span className="text-foreground font-medium">{elderId ? `Elder ID: ${elderId.slice(0, 8)}...` : "no linked elder"}</span>
            </p>
          </div>
          <Button 
            onClick={handleGenerateToday} 
            disabled={isGenerating || !elderId} 
            size="lg"
            className="gap-2 shadow-button hover:shadow-button-hover transition-all"
          >
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
            Generate Intelligence Summary
          </Button>
        </div>

        {!elderId && (
          <Card className="border-2 border-primary/20 bg-primary/5 mb-12 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Link Your Elder
              </CardTitle>
              <CardDescription>Connect to your loved one's account to start receiving insights.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter elder's email address"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  className="sm:max-w-md h-12 text-lg"
                />
                <Button onClick={handleLinkElder} disabled={linking} size="lg" className="sm:w-auto w-full">
                  {linking && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Establish Link
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium">Synchronizing latest memory data...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {elderId && (
              <>
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-display font-semibold">Activity Overview</h2>
                  </div>
                  <CaregiverInsights memories={memories} />
                </section>

                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:shadow-sm">
                      <History className="w-4 h-4 mr-2" />
                      Memory Timeline
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="rounded-lg data-[state=active]:shadow-sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Q&A Interaction
                    </TabsTrigger>
                    <TabsTrigger value="summaries" className="rounded-lg data-[state=active]:shadow-sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Daily Intelligence
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="timeline" className="focus-visible:ring-0">
                    <MemoryTimeline memories={memories} />
                  </TabsContent>

                  <TabsContent value="questions" className="focus-visible:ring-0">
                    <div className="grid gap-4">
                      {questions.length === 0 ? (
                        <Card className="border-dashed border-2 py-12 text-center">
                          <p className="text-muted-foreground">No questions recorded yet.</p>
                        </Card>
                      ) : (
                        questions.map((q) => (
                          <Card key={q.id} className="border shadow-sm overflow-hidden group">
                            <CardHeader className="bg-muted/30 pb-3">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-medium">{q.question_text}</CardTitle>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {formatDate(q.created_at)}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="flex gap-3">
                                <div className="mt-1">
                                  <Brain className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-foreground leading-relaxed">
                                    {q.answer_text || "Awaiting answer..."}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Resolved at {formatTime(q.created_at)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="summaries" className="focus-visible:ring-0">
                    <div className="grid gap-6">
                      {summaries.length === 0 ? (
                        <Card className="border-dashed border-2 py-12 text-center">
                          <p className="text-muted-foreground">No intelligence summaries generated.</p>
                        </Card>
                      ) : (
                        summaries.map((s) => {
                          const isExpanded = expandedSummaries.has(s.id)
                          return (
                            <Card key={s.id} className="border shadow-sm">
                              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <div>
                                  <CardTitle className="text-xl font-display">{formatDate(s.date)}</CardTitle>
                                  <CardDescription>Daily cognitive digest</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadSummary(s)}
                                    className="h-9"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSummary(s.id)}
                                    className="h-9"
                                  >
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className={`text-foreground leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}>
                                  {s.summary_text}
                                </p>
                              </CardContent>
                            </Card>
                          )
                        })
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

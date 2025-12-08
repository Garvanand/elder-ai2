"use client"

import { useState } from "react"
import { ElderHome } from "@/components/memory-friend/elder-home"
import { MemoryForm } from "@/components/memory-friend/memory-form"
import { AskQuestionForm } from "@/components/memory-friend/ask-question-form"
import { CaregiverDashboard } from "@/components/memory-friend/caregiver-dashboard"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users } from "lucide-react"

type View = "home" | "add-memory" | "ask-question" | "caregiver"

export default function DemoPage() {
  const [currentView, setCurrentView] = useState<View>("home")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleMemorySuccess = () => {
    setCurrentView("home")
    // Trigger refresh by updating key
    setRefreshKey((prev) => prev + 1)
  }

  const handleQuestionSuccess = () => {
    // Trigger refresh by updating key
    setRefreshKey((prev) => prev + 1)
  }

  // Caregiver Dashboard View
  if (currentView === "caregiver") {
    return (
      <div>
        <header className="border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-4 px-6 py-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setCurrentView("home")}
              className="gap-2"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Caregiver Dashboard</h1>
          </div>
        </header>
        <CaregiverDashboard />
      </div>
    )
  }

  // Add Memory View
  if (currentView === "add-memory") {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setCurrentView("home")}
          className="mb-8 gap-2 text-lg"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Add a Memory</h1>
        <MemoryForm onSuccess={handleMemorySuccess} />
      </div>
    )
  }

  // Ask Question View
  if (currentView === "ask-question") {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setCurrentView("home")}
          className="mb-8 gap-2 text-lg"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">Ask a Question</h1>
        <AskQuestionForm onSuccess={handleQuestionSuccess} />
      </div>
    )
  }

  // Home View
  return (
    <div>
      <header className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentView("caregiver")}
          className="gap-2"
          aria-label="Open caregiver dashboard"
        >
          <Users className="h-5 w-5" />
          Caregiver View
        </Button>
      </header>
      <ElderHome
        userName="Margaret"
        onAddMemory={() => setCurrentView("add-memory")}
        onAskQuestion={() => setCurrentView("ask-question")}
      />
    </div>
  )
}

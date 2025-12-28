"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TerminalDemoProps {
  theme?: "dark" | "light"
  accentColor?: string
}

export function TerminalDemo({ theme = "dark", accentColor = "#3b82f6" }: TerminalDemoProps) {
  const steps = [
    { command: "held init", success: "✓ Held initialized successfully" },
    { command: "held connect team", success: "✓ Connected to team workspace" },
  ]

  const [currentScenario, setCurrentScenario] = useState(0)
  const [displayedQuestion, setDisplayedQuestion] = useState("")
  const [displayedResponse, setDisplayedResponse] = useState("")
  const [isTypingQuestion, setIsTypingQuestion] = useState(false)
  const [isTypingResponse, setIsTypingResponse] = useState(false)

  const scenarios = [
    {
      question: "What did Jeff run last week?",
      response:
        "Jeff ran `docker-compose up -d` to start the production environment, followed by `kubectl apply -f deployment.yaml` to deploy the latest changes.",
    },
    {
      question: "What did I run to start the React project?",
      response:
        "You ran `npm create react-app my-project` to initialize the project, then `cd my-project && npm start` to start the development server.",
    },
  ]

  useEffect(() => {
    const animateChat = async () => {
      const scenario = scenarios[currentScenario]

      // Reset states
      setDisplayedQuestion("")
      setDisplayedResponse("")
      setIsTypingQuestion(true)
      setIsTypingResponse(false)

      // Type question
      for (let i = 0; i <= scenario.question.length; i++) {
        setDisplayedQuestion(scenario.question.slice(0, i))
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      setIsTypingQuestion(false)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Type response
      setIsTypingResponse(true)
      for (let i = 0; i <= scenario.response.length; i++) {
        setDisplayedResponse(scenario.response.slice(0, i))
        await new Promise((resolve) => setTimeout(resolve, 30))
      }

      setIsTypingResponse(false)
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Move to next scenario
      setCurrentScenario((prev) => (prev + 1) % scenarios.length)
    }

    animateChat()
  }, [currentScenario])

  const [currentInput, setCurrentInput] = useState("")

  return (
    <div className="w-full max-w-6xl mx-auto flex gap-4 h-[400px]">
      {/* Terminal Window */}
      <div className="flex-1 rounded-lg overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500" style={{ backgroundColor: "hsl(var(--muted))" }}>
        {/* Terminal Header */}
        <div
          className="flex items-center px-4 py-3 border-b"
          style={{ backgroundColor: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:scale-110 transition-transform duration-300"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:scale-110 transition-transform duration-300"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:scale-110 transition-transform duration-300"></div>
          </div>
          <div className="text-xs font-mono ml-4" style={{ color: "hsl(var(--foreground))" }}>
            terminal — held
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-3 font-mono text-sm space-y-2 min-h-[280px]" style={{ backgroundColor: "hsl(var(--background))" }}>
          {steps.map((step, index) => (
            <div key={index}>
              <div className="flex items-center space-x-2 hover:translate-x-1 transition-transform duration-300">
                <span style={{ color: "hsl(var(--foreground))" }}>$</span>
                <span style={{ color: "hsl(var(--foreground))" }}>{step.command}</span>
              </div>
              <div className="ml-2 hover:scale-105 transition-transform duration-300" style={{ color: "#00ff88" }}>
                {step.success}
              </div>
            </div>
          ))}

          <div className="flex items-center space-x-2 hover:translate-x-1 transition-transform duration-300">
            <span style={{ color: "hsl(var(--foreground))" }}>$</span>
            <span style={{ color: "hsl(var(--foreground))" }}>npm</span>
            <span className="animate-pulse hover:scale-110 transition-transform duration-300" style={{ color: "hsl(var(--primary))" }}>
              |
            </span>
          </div>
        </div>
      </div>

      {/* Held Search Sidebar */}
      <div className="w-80 rounded-lg overflow-hidden shadow-2xl glass-card hover:scale-[1.02] transition-transform duration-500">
        <div className="px-4 py-3 border-b" style={{ backgroundColor: "hsl(hsl(var(--muted-foreground)))", borderColor: "hsl(var(--border))" }}>
          <div className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>
            Held
          </div>
        </div>

        {/* Search Controls */}
        <div className="p-4 border-b" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex space-x-2 mb-3">
            <Button
              size="sm"
              className="font-medium"
              style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              Ask AI
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="font-medium bg-transparent"
              style={{
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--muted-foreground))",
                backgroundColor: "transparent",
              }}
            >
              Search only
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-3 space-y-3 max-h-64 overflow-y-auto">
          <div className="space-y-4">
            {/* User Question */}
            {displayedQuestion && (
              <div className="flex justify-end">
                <div
                  className="px-3 py-2 rounded-lg max-w-xs text-sm"
                  style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                >
                  {displayedQuestion}
                  {isTypingQuestion && <span className="animate-pulse">|</span>}
                </div>
              </div>
            )}

            {/* AI Response */}
            {displayedResponse && (
              <div className="space-y-1">
                <div className="text-sm leading-relaxed" style={{ color: "hsl(var(--foreground))", lineHeight: 1.6 }}>
                  {displayedResponse}
                  {isTypingResponse && <span className="animate-pulse">|</span>}
                </div>
                {!isTypingResponse && (
                  <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    answered in 1.8s
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3 border-t" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Ask Held..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              className="flex-1"
              style={{
                backgroundColor: "hsl(hsl(var(--muted-foreground)))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            />
            <Button size="sm" style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              <span>→</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

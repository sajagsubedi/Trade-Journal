'use client'

import { Sidebar } from '@/components/sidebar'
import { AIChatbot } from '@/components/ai-chatbot'
import { AICoachInsights } from '@/components/ai-coach-insights'

export default function AICoachPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="md:pl-64">
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">AI Coach</h1>
            <p className="text-muted-foreground mt-1">
              Get personalized trading insights and recommendations
            </p>
          </div>

          <AICoachInsights />
        </div>
      </main>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  )
}

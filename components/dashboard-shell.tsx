'use client'

import { Sidebar } from '@/components/sidebar'
import { AIChatbot } from '@/components/ai-chatbot'

interface DashboardShellProps {
  children: React.ReactNode
  showChatbot?: boolean
}

export function DashboardShell({ children, showChatbot = true }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {showChatbot && <AIChatbot />}
    </div>
  )
}

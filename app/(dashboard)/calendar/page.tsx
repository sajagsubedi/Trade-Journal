'use client'

import { DashboardShell } from '@/components/dashboard-shell'
import { TradeCalendar } from '@/components/trade-calendar'

export default function CalendarPage() {
  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Trade Calendar</h1>
        <p className="text-muted-foreground mt-1">
          View your daily trading activity at a glance
        </p>
      </div>

      <TradeCalendar />
    </DashboardShell>
  )
}

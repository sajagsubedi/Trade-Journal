'use client'

import { DashboardShell } from '@/components/dashboard-shell'
import { StatsCards, BestWorstTrades, SmartAlerts } from '@/components/stats-cards'
import { EquityCurve, WinLossChart, DailyPerformanceChart } from '@/components/charts'
import { RecentTrades } from '@/components/recent-trades'

export default function Dashboard() {
  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your trading performance
        </p>
      </div>

      <div className="mb-6">
        <SmartAlerts />
      </div>

      <StatsCards />

      <div className="grid gap-4 mt-6 lg:grid-cols-2">
        <EquityCurve />
        <WinLossChart />
      </div>

      <div className="grid gap-4 mt-6 lg:grid-cols-2">
        <BestWorstTrades />
        <DailyPerformanceChart />
      </div>

      <div className="mt-6">
        <RecentTrades />
      </div>
    </DashboardShell>
  )
}

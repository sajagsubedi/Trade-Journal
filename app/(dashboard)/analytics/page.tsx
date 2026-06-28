'use client'

import { DashboardShell } from '@/components/dashboard-shell'
import { StatsCards } from '@/components/stats-cards'
import { TradeFilters } from '@/components/trade-filters'
import { EquityCurve, WinLossChart, ProfitOverTimeChart } from '@/components/charts'
import {
  StrategyPerformanceChart,
  MistakeTrackingChart,
  WeeklyPerformanceChart,
  PairPerformanceChart,
  TradingRadarChart,
} from '@/components/analytics-charts'

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Deep dive into your trading performance
        </p>
      </div>

      <div className="mb-6">
        <TradeFilters />
      </div>

      <StatsCards />

      <div className="grid gap-4 mt-6 lg:grid-cols-2">
        <EquityCurve />
        <ProfitOverTimeChart />
      </div>

      <div className="grid gap-4 mt-6 lg:grid-cols-2">
        <WinLossChart />
        <TradingRadarChart />
      </div>

      <div className="grid gap-4 mt-6 lg:grid-cols-2">
        <StrategyPerformanceChart />
        <MistakeTrackingChart />
      </div>

      <div className="grid gap-4 mt-6 lg:grid-cols-2">
        <WeeklyPerformanceChart />
        <PairPerformanceChart />
      </div>
    </DashboardShell>
  )
}

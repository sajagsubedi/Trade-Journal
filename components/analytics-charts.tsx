'use client'

import { useTradeStore } from '@/store/trade-store'
import { useFormatCurrency } from '@/hooks/use-currency'
import { formatPercent } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

const COLORS = {
  primary: 'oklch(0.65 0.2 260)',
  success: 'oklch(0.7 0.18 150)',
  destructive: 'oklch(0.6 0.22 25)',
  muted: 'oklch(0.4 0 0)',
}

export function StrategyPerformanceChart() {
  const { format: formatCurrency, formatAxis } = useFormatCurrency()
  const getStrategyPerformance = useTradeStore((state) => state.getStrategyPerformance)
  const data = getStrategyPerformance()

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Strategy Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No strategy data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Strategy Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 260)" />
              <XAxis 
                type="number" 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
                tickFormatter={(value) => formatAxis(value)}
              />
              <YAxis 
                type="category" 
                dataKey="strategy" 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.12 0.005 260)',
                  border: '1px solid oklch(0.22 0.01 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.95 0 0)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'profit') return [formatCurrency(value), 'Profit/Loss']
                  if (name === 'winRate') return [formatPercent(value), 'Win Rate']
                  return [value, name]
                }}
              />
              <Bar 
                dataKey="profit" 
                radius={[0, 4, 4, 0]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.profit >= 0 ? COLORS.success : COLORS.destructive} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function MistakeTrackingChart() {
  const getMistakeFrequency = useTradeStore((state) => state.getMistakeFrequency)
  const data = getMistakeFrequency().slice(0, 8)

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Common Mistakes</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No mistakes recorded</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Common Mistakes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 260)" />
              <XAxis 
                dataKey="mistake" 
                stroke="oklch(0.65 0 0)" 
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.12 0.005 260)',
                  border: '1px solid oklch(0.22 0.01 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.95 0 0)',
                }}
              />
              <Bar 
                dataKey="count" 
                fill={COLORS.destructive}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function WeeklyPerformanceChart() {
  const { format: formatCurrency, formatAxis } = useFormatCurrency()
  const getWeeklyPerformance = useTradeStore((state) => state.getWeeklyPerformance)
  const data = getWeeklyPerformance()

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No weekly data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Weekly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 260)" />
              <XAxis 
                dataKey="week" 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
              />
              <YAxis 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
                tickFormatter={(value) => formatAxis(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.12 0.005 260)',
                  border: '1px solid oklch(0.22 0.01 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.95 0 0)',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Profit/Loss']}
              />
              <Bar 
                dataKey="profit" 
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.profit >= 0 ? COLORS.success : COLORS.destructive} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function PairPerformanceChart() {
  const { format: formatCurrency } = useFormatCurrency()
  const trades = useTradeStore((state) => state.trades)
  
  const pairStats = trades.reduce((acc, trade) => {
    if (!acc[trade.pair]) {
      acc[trade.pair] = { wins: 0, total: 0, profit: 0 }
    }
    acc[trade.pair].total++
    acc[trade.pair].profit += trade.profitLoss
    if (trade.result === 'win') acc[trade.pair].wins++
    return acc
  }, {} as Record<string, { wins: number; total: number; profit: number }>)

  const data = Object.entries(pairStats)
    .map(([pair, stats]) => ({
      pair,
      winRate: (stats.wins / stats.total) * 100,
      profit: stats.profit,
      trades: stats.total,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8)

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Pair Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No pair data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Pair Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.pair} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.pair}</span>
                <span className={item.profit >= 0 ? 'text-success' : 'text-destructive'}>
                  {formatCurrency(item.profit)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${item.winRate}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-20">
                  {formatPercent(item.winRate)} win
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.trades} trades</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TradingRadarChart() {
  const getStats = useTradeStore((state) => state.getStats)
  const stats = getStats()

  if (stats.totalTrades === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Trading Profile</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const data = [
    { 
      metric: 'Win Rate', 
      value: Math.min(stats.winRate, 100),
      fullMark: 100 
    },
    { 
      metric: 'Risk/Reward', 
      value: Math.min(stats.averageRiskReward * 25, 100),
      fullMark: 100 
    },
    { 
      metric: 'Consistency', 
      value: stats.winRate >= 50 ? 70 : 30,
      fullMark: 100 
    },
    { 
      metric: 'Volume', 
      value: Math.min(stats.totalTrades * 5, 100),
      fullMark: 100 
    },
    { 
      metric: 'Profitability', 
      value: stats.totalProfitLoss > 0 ? 80 : 20,
      fullMark: 100 
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Trading Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="oklch(0.22 0.01 260)" />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: 'oklch(0.65 0 0)', fontSize: 10 }}
              />
              <Radar
                name="Performance"
                dataKey="value"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useTradeStore } from '@/store/trade-store'
import { useFormatCurrency } from '@/hooks/use-currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const COLORS = {
  win: 'oklch(0.7 0.18 150)',
  loss: 'oklch(0.6 0.22 25)',
  breakeven: 'oklch(0.65 0 0)',
  primary: 'oklch(0.65 0.2 260)',
  profit: 'oklch(0.7 0.18 150)',
  loss2: 'oklch(0.6 0.22 25)',
}

export function EquityCurve() {
  const { format: formatCurrency, formatAxis } = useFormatCurrency()
  const getEquityCurve = useTradeStore((state) => state.getEquityCurve)
  const data = getEquityCurve()

  if (data.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-sm font-medium">Equity Curve</CardTitle>
        </CardHeader>
        <CardContent className="relative h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No trade data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <CardHeader className="relative">
        <CardTitle className="text-sm font-medium">Equity Curve</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 260)" />
              <XAxis 
                dataKey="date" 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => formatAxis(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.12 0.005 260)',
                  border: '1px solid oklch(0.22 0.01 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.95 0 0)',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Equity']}
              />
              <Line
                type="monotone"
                dataKey="equity"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: COLORS.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function WinLossChart() {
  const getStats = useTradeStore((state) => state.getStats)
  const stats = getStats()

  const data = [
    { name: 'Wins', value: stats.winningTrades, color: COLORS.win },
    { name: 'Losses', value: stats.losingTrades, color: COLORS.loss },
    { name: 'Breakeven', value: stats.breakevenTrades, color: COLORS.breakeven },
  ].filter((item) => item.value > 0)

  if (data.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-sm font-medium">Win/Loss Distribution</CardTitle>
        </CardHeader>
        <CardContent className="relative h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No trade data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
      <CardHeader className="relative">
        <CardTitle className="text-sm font-medium">Win/Loss Distribution</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.12 0.005 260)',
                  border: '1px solid oklch(0.22 0.01 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.95 0 0)',
                }}
              />
              <Legend 
                wrapperStyle={{ color: 'oklch(0.95 0 0)' }}
                formatter={(value) => <span style={{ color: 'oklch(0.65 0 0)' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function DailyPerformanceChart() {
  const { format: formatCurrency, formatAxis } = useFormatCurrency()
  const getDailyPerformance = useTradeStore((state) => state.getDailyPerformance)
  const data = getDailyPerformance()

  if (data.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-sm font-medium">Daily Performance</CardTitle>
        </CardHeader>
        <CardContent className="relative h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No trade data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <CardHeader className="relative">
        <CardTitle className="text-sm font-medium">Daily Performance</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 260)" />
              <XAxis 
                dataKey="date" 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
                tickLine={false}
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
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfitOverTimeChart() {
  const { format: formatCurrency, formatAxis } = useFormatCurrency()
  const getDailyPerformance = useTradeStore((state) => state.getDailyPerformance)
  const data = getDailyPerformance()
  
  // Calculate cumulative profit
  let cumulative = 0
  const cumulativeData = data.map((item) => {
    cumulative += item.profit
    return { ...item, cumulative }
  })

  if (cumulativeData.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-sm font-medium">Cumulative Profit</CardTitle>
        </CardHeader>
        <CardContent className="relative h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No trade data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent" />
      <CardHeader className="relative">
        <CardTitle className="text-sm font-medium">Cumulative Profit</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 260)" />
              <XAxis 
                dataKey="date" 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="oklch(0.65 0 0)" 
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => formatAxis(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.12 0.005 260)',
                  border: '1px solid oklch(0.22 0.01 260)',
                  borderRadius: '8px',
                  color: 'oklch(0.95 0 0)',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Cumulative P/L']}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke={COLORS.profit}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: COLORS.profit }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

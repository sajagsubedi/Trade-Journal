'use client'

import { useTradeStore } from '@/store/trade-store'
import { useHydration } from '@/hooks/use-hydration'
import { formatPercent, getSessionLabel } from '@/lib/helpers'
import { useFormatCurrency } from '@/hooks/use-currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Activity, Target, Percent, Clock, Flame, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

function StatsCardSkeleton() {
  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const isHydrated = useHydration()
  const { format: formatCurrency } = useFormatCurrency()
  const getStats = useTradeStore((state) => state.getStats)
  const getBestSession = useTradeStore((state) => state.getBestSession)
  const getStreaks = useTradeStore((state) => state.getStreaks)

  if (!isHydrated) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    )
  }
  
  const stats = getStats()
  const bestSession = getBestSession()
  const streaks = getStreaks()

  const cards = [
    {
      title: 'Total Trades',
      value: stats.totalTrades.toString(),
      icon: Activity,
      description: `${stats.winningTrades}W / ${stats.losingTrades}L / ${stats.breakevenTrades}BE`,
      trend: null,
      gradient: 'from-blue-500/20 to-cyan-500/10',
    },
    {
      title: 'Win Rate',
      value: formatPercent(stats.winRate),
      icon: Percent,
      description: stats.winRate >= 50 ? 'Above average' : 'Below average',
      trend: stats.winRate >= 50 ? 'up' : 'down',
      gradient: stats.winRate >= 50 ? 'from-emerald-500/20 to-green-500/10' : 'from-red-500/20 to-rose-500/10',
    },
    {
      title: 'Total P/L',
      value: formatCurrency(stats.totalProfitLoss),
      icon: stats.totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
      description: stats.totalProfitLoss >= 0 ? 'In profit' : 'In loss',
      trend: stats.totalProfitLoss >= 0 ? 'up' : 'down',
      gradient: stats.totalProfitLoss >= 0 ? 'from-emerald-500/20 to-green-500/10' : 'from-red-500/20 to-rose-500/10',
    },
    {
      title: 'Avg Risk/Reward',
      value: `${stats.averageRiskReward.toFixed(2)}:1`,
      icon: Target,
      description: stats.averageRiskReward >= 2 ? 'Excellent' : stats.averageRiskReward >= 1 ? 'Good' : 'Needs work',
      trend: stats.averageRiskReward >= 1.5 ? 'up' : 'down',
      gradient: 'from-purple-500/20 to-violet-500/10',
    },
    {
      title: 'Best Session',
      value: bestSession ? getSessionLabel(bestSession.session) : 'N/A',
      icon: Clock,
      description: bestSession ? `${formatPercent(bestSession.winRate)} win rate` : 'No data yet',
      trend: bestSession && bestSession.winRate >= 50 ? 'up' : null,
      gradient: 'from-amber-500/20 to-orange-500/10',
    },
    {
      title: 'Win Streak',
      value: streaks.currentWinStreak.toString(),
      icon: Flame,
      description: `Best: ${streaks.bestWinStreak} | Discipline: ${streaks.disciplineStreak}d`,
      trend: streaks.currentWinStreak >= 3 ? 'up' : null,
      gradient: 'from-pink-500/20 to-rose-500/10',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className={cn(
            "relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50",
            "hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          )}
        >
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50",
            card.gradient
          )} />
          <CardHeader className="relative flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={cn(
              "h-4 w-4",
              card.trend === 'up' ? "text-success" : card.trend === 'down' ? "text-destructive" : "text-muted-foreground"
            )} />
          </CardHeader>
          <CardContent className="relative">
            <div className={cn(
              "text-2xl font-bold",
              card.trend === 'up' ? "text-success" : card.trend === 'down' ? "text-destructive" : "text-foreground"
            )}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function BestWorstTrades() {
  const isHydrated = useHydration()
  const { format: formatCurrency } = useFormatCurrency()
  const getStats = useTradeStore((state) => state.getStats)
  
  if (!isHydrated) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const stats = getStats()

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5" />
        <CardHeader className="relative pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            Best Trade
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {stats.bestTrade ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-success">
                {formatCurrency(stats.bestTrade.profitLoss)}
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.bestTrade.pair} | {stats.bestTrade.strategy}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">No trades recorded</p>
          )}
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/5" />
        <CardHeader className="relative pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            Worst Trade
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {stats.worstTrade ? (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(stats.worstTrade.profitLoss)}
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.worstTrade.pair} | {stats.worstTrade.strategy}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">No trades recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function SmartAlerts() {
  const isHydrated = useHydration()
  const getTodayStats = useTradeStore((state) => state.getTodayStats)
  const settings = useTradeStore((state) => state.settings)
  const getStreaks = useTradeStore((state) => state.getStreaks)
  
  if (!isHydrated) {
    return null
  }
  
  const todayStats = getTodayStats()
  const streaks = getStreaks()
  
  const alerts: { type: string; icon: typeof AlertTriangle; title: string; message: string }[] = []
  
  if (todayStats.riskUsed >= settings.dailyRiskLimit) {
    alerts.push({
      type: 'danger',
      icon: AlertTriangle,
      title: 'Daily Risk Limit Exceeded',
      message: `You've used ${todayStats.riskUsed.toFixed(1)}% of your account today. Consider stopping.`,
    })
  } else if (todayStats.riskUsed >= settings.dailyRiskLimit * 0.8) {
    alerts.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Approaching Risk Limit',
      message: `${(settings.dailyRiskLimit - todayStats.riskUsed).toFixed(1)}% risk remaining for today.`,
    })
  }
  
  if (todayStats.trades >= settings.maxTradesPerDay) {
    alerts.push({
      type: 'danger',
      icon: Activity,
      title: 'Max Trades Reached',
      message: `You've taken ${todayStats.trades} trades today. Stop trading for today.`,
    })
  }
  
  if (streaks.currentLossStreak >= 3) {
    alerts.push({
      type: 'warning',
      icon: TrendingDown,
      title: 'Loss Streak Alert',
      message: `You're on a ${streaks.currentLossStreak} trade losing streak. Take a break.`,
    })
  }
  
  if (streaks.currentWinStreak >= 5) {
    alerts.push({
      type: 'success',
      icon: Flame,
      title: 'Hot Streak!',
      message: `Amazing! ${streaks.currentWinStreak} wins in a row. Stay disciplined.`,
    })
  }
  
  if (alerts.length === 0) {
    return null
  }
  
  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <Card 
          key={index}
          className={cn(
            "relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50",
            alert.type === 'danger' && "border-destructive/50",
            alert.type === 'warning' && "border-warning/50",
            alert.type === 'success' && "border-success/50"
          )}
        >
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r opacity-30",
            alert.type === 'danger' && "from-destructive/20 to-transparent",
            alert.type === 'warning' && "from-warning/20 to-transparent",
            alert.type === 'success' && "from-success/20 to-transparent"
          )} />
          <CardContent className="relative flex items-center gap-3 py-3">
            <alert.icon className={cn(
              "h-5 w-5 shrink-0",
              alert.type === 'danger' && "text-destructive",
              alert.type === 'warning' && "text-warning",
              alert.type === 'success' && "text-success"
            )} />
            <div>
              <p className="font-medium text-sm">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { useTradeStore } from '@/store/trade-store'
import { useFormatCurrency } from '@/hooks/use-currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Target,
  BarChart3,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type Intensity = 'high' | 'medium' | 'low'

function getIntensity(value: number, max: number): Intensity {
  if (max === 0) return 'low'
  const ratio = Math.abs(value) / max
  if (ratio > 0.66) return 'high'
  if (ratio > 0.33) return 'medium'
  return 'low'
}

function getDayCellStyles(
  result: 'positive' | 'negative' | 'neutral',
  intensity: Intensity
): string {
  if (result === 'positive') {
    if (intensity === 'high') return 'bg-success/35 border-success/50 glow-success'
    if (intensity === 'medium') return 'bg-success/25 border-success/40'
    return 'bg-success/15 border-success/30'
  }
  if (result === 'negative') {
    if (intensity === 'high') return 'bg-destructive/35 border-destructive/50 glow-destructive'
    if (intensity === 'medium') return 'bg-destructive/25 border-destructive/40'
    return 'bg-destructive/15 border-destructive/30'
  }
  return 'bg-muted/20 border-border/30'
}

export function TradeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const trades = useTradeStore((state) => state.trades)
  const settings = useTradeStore((state) => state.settings)
  const getCalendarData = useTradeStore((state) => state.getCalendarData)
  const { format, formatCompact } = useFormatCurrency()

  const calendarData = getCalendarData()

  const tradesByDate = useMemo(() => {
    const map = new Map<string, typeof calendarData[0]>()
    calendarData.forEach((day) => {
      map.set(day.date, day)
    })
    return map
  }, [calendarData])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(null)
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  const days: Array<{ day: number; date: string; data?: typeof calendarData[0] } | null> = []

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      day: i,
      date: dateStr,
      data: tradesByDate.get(dateStr),
    })
  }

  const selectedDateTrades = selectedDate
    ? trades.filter((t) => t.dateTime.startsWith(selectedDate))
    : []

  const monthlyStats = useMemo(() => {
    const monthStart = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    const monthTrades = trades.filter((t) => t.dateTime.startsWith(monthStart))
    const profit = monthTrades.reduce((sum, t) => sum + t.profitLoss, 0)
    const wins = monthTrades.filter((t) => t.result === 'win').length
    const tradingDays = new Set(monthTrades.map((t) => t.dateTime.split('T')[0])).size
    const maxDayProfit = Math.max(
      0,
      ...Array.from(tradesByDate.values())
        .filter((d) => d.date.startsWith(monthStart))
        .map((d) => Math.abs(d.profit))
    )

    return {
      trades: monthTrades.length,
      profit,
      wins,
      losses: monthTrades.filter((t) => t.result === 'loss').length,
      winRate: monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0,
      tradingDays,
      maxDayProfit,
      targetProgress:
        settings.monthlyProfitTarget > 0
          ? Math.min(100, (profit / settings.monthlyProfitTarget) * 100)
          : 0,
    }
  }, [trades, currentDate, tradesByDate, settings.monthlyProfitTarget])

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {/* Month header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={prevMonth} className="shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Trading performance overview
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={nextMonth} className="shrink-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="shrink-0">
              Today
            </Button>
          </div>
        </div>

        {/* Monthly stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <BarChart3 className="h-3.5 w-3.5" />
                Total Trades
              </div>
              <p className="text-2xl font-bold">{monthlyStats.trades}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Monthly P/L
              </div>
              <p className={cn(
                'text-2xl font-bold',
                monthlyStats.profit >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {format(monthlyStats.profit)}
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Target className="h-3.5 w-3.5" />
                Win Rate
              </div>
              <p className="text-2xl font-bold">{monthlyStats.winRate.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Flame className="h-3.5 w-3.5" />
                Trading Days
              </div>
              <p className="text-2xl font-bold">{monthlyStats.tradingDays}</p>
              {settings.monthlyProfitTarget > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Monthly target</span>
                    <span>{monthlyStats.targetProgress.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${monthlyStats.targetProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendar grid */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50 shadow-lg shadow-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardContent className="relative p-4 sm:p-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {DAYS.map((day, i) => (
              <div
                key={day}
                className={cn(
                  'text-center text-xs sm:text-sm font-semibold py-2 rounded-md',
                  i === 0 || i === 6 ? 'text-muted-foreground/70' : 'text-muted-foreground'
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((dayData, index) => {
              if (!dayData) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[72px] sm:min-h-[88px] rounded-xl bg-muted/5"
                  />
                )
              }

              const isToday = dayData.date === todayStr
              const isSelected = dayData.date === selectedDate
              const hasData = dayData.data
              const dayOfWeek = new Date(dayData.date).getDay()
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
              const intensity = hasData
                ? getIntensity(hasData.profit, monthlyStats.maxDayProfit)
                : 'low'

              return (
                <button
                  key={dayData.date}
                  onClick={() => setSelectedDate(dayData.date)}
                  className={cn(
                    'min-h-[72px] sm:min-h-[88px] p-2 rounded-xl transition-all duration-200',
                    'flex flex-col items-center justify-center gap-1',
                    'border hover:scale-[1.02] hover:shadow-md',
                    isWeekend && !hasData && 'bg-muted/10',
                    isToday && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                    isSelected && 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-[1.02]',
                    hasData
                      ? getDayCellStyles(hasData.result, intensity)
                      : 'border-border/20 hover:bg-muted/30 hover:border-border/40'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm sm:text-base font-semibold',
                      isToday && 'text-primary',
                      hasData && hasData.result === 'positive' && 'text-success',
                      hasData && hasData.result === 'negative' && 'text-destructive'
                    )}
                  >
                    {dayData.day}
                  </span>

                  {hasData && (
                    <>
                      <span
                        className={cn(
                          'text-[10px] sm:text-xs font-bold leading-tight',
                          hasData.result === 'positive' ? 'text-success' :
                          hasData.result === 'negative' ? 'text-destructive' :
                          'text-muted-foreground'
                        )}
                      >
                        {formatCompact(hasData.profit)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] px-1 py-0 h-4 border-0',
                            hasData.result === 'positive' ? 'bg-success/20 text-success' :
                            hasData.result === 'negative' ? 'bg-destructive/20 text-destructive' :
                            'bg-muted text-muted-foreground'
                          )}
                        >
                          {hasData.trades} trade{hasData.trades !== 1 ? 's' : ''}
                        </Badge>
                        {hasData.result === 'positive' ? (
                          <TrendingUp className="h-3.5 w-3.5 text-success" />
                        ) : hasData.result === 'negative' ? (
                          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                        ) : null}
                      </div>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected date details */}
      {selectedDate && (
        <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString(settings.locale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {selectedDateTrades.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No trades on this day
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-3 flex-wrap mb-4">
                  <Badge variant="outline" className="py-1.5 px-3">
                    {selectedDateTrades.length} trades
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'py-1.5 px-3',
                      selectedDateTrades.reduce((s, t) => s + t.profitLoss, 0) >= 0
                        ? 'border-success/50 text-success bg-success/10'
                        : 'border-destructive/50 text-destructive bg-destructive/10'
                    )}
                  >
                    {format(selectedDateTrades.reduce((s, t) => s + t.profitLoss, 0))}
                  </Badge>
                  <Badge variant="outline" className="py-1.5 px-3 border-success/30 text-success">
                    {selectedDateTrades.filter((t) => t.result === 'win').length} wins
                  </Badge>
                  <Badge variant="outline" className="py-1.5 px-3 border-destructive/30 text-destructive">
                    {selectedDateTrades.filter((t) => t.result === 'loss').length} losses
                  </Badge>
                </div>

                <div className="space-y-2">
                  {selectedDateTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl',
                        'bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30'
                      )}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                          {trade.type.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{trade.pair}</span>
                        <span className="text-sm text-muted-foreground">
                          {trade.strategy}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'font-semibold text-lg',
                          trade.result === 'win' ? 'text-success' :
                          trade.result === 'loss' ? 'text-destructive' :
                          'text-muted-foreground'
                        )}
                      >
                        {format(trade.profitLoss)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-success/30 border border-success/50 glow-success" />
          <span className="text-muted-foreground">Strong Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-success/15 border border-success/30" />
          <span className="text-muted-foreground">Profit Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-destructive/30 border border-destructive/50 glow-destructive" />
          <span className="text-muted-foreground">Strong Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-destructive/15 border border-destructive/30" />
          <span className="text-muted-foreground">Loss Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background" />
          <span className="text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  )
}

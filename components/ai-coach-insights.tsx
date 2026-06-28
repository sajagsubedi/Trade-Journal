'use client'

import { useTradeStore } from '@/store/trade-store'
import { formatPercent, getSessionLabel } from '@/lib/helpers'
import { useFormatCurrency } from '@/hooks/use-currency'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Lightbulb,
  Shield,
  Zap,
  Moon,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function AICoachInsights() {
  const { format: formatCurrency } = useFormatCurrency()
  const trades = useTradeStore((state) => state.trades)
  const getStats = useTradeStore((state) => state.getStats)
  const getSessionPerformance = useTradeStore((state) => state.getSessionPerformance)
  const getMistakeFrequency = useTradeStore((state) => state.getMistakeFrequency)
  const getStrategyPerformance = useTradeStore((state) => state.getStrategyPerformance)
  const getStreaks = useTradeStore((state) => state.getStreaks)
  
  const stats = getStats()
  const sessionPerf = getSessionPerformance()
  const mistakes = getMistakeFrequency()
  const strategies = getStrategyPerformance()
  const streaks = getStreaks()

  // Generate personalized insights
  const generateInsights = () => {
    const insights: { type: 'success' | 'warning' | 'info' | 'danger'; icon: typeof Brain; title: string; message: string }[] = []
    
    if (trades.length === 0) {
      return [{
        type: 'info' as const,
        icon: Brain,
        title: 'Get Started',
        message: 'Start logging your trades to receive personalized AI coaching insights.',
      }]
    }
    
    // Session-based insight
    if (sessionPerf.length > 0) {
      const bestSession = sessionPerf.reduce((prev, curr) => 
        curr.winRate > prev.winRate ? curr : prev
      )
      const worstSession = sessionPerf.reduce((prev, curr) => 
        curr.winRate < prev.winRate ? curr : prev
      )
      
      if (bestSession.trades >= 3) {
        insights.push({
          type: 'success',
          icon: Clock,
          title: 'Best Trading Time',
          message: `You perform best during the ${getSessionLabel(bestSession.session)} session with a ${formatPercent(bestSession.winRate)} win rate. Focus your trading during this time.`,
        })
      }
      
      if (worstSession.trades >= 3 && worstSession.winRate < 40) {
        insights.push({
          type: 'warning',
          icon: Moon,
          title: 'Avoid Trading',
          message: `Consider avoiding the ${getSessionLabel(worstSession.session)} session. Your win rate is only ${formatPercent(worstSession.winRate)} during this time.`,
        })
      }
    }
    
    // Mistake pattern insight
    if (mistakes.length > 0) {
      const topMistake = mistakes[0]
      const mistakePercentage = (topMistake.count / trades.length) * 100
      
      if (mistakePercentage > 30) {
        insights.push({
          type: 'danger',
          icon: AlertTriangle,
          title: 'Critical Pattern Detected',
          message: `"${topMistake.mistake}" appears in ${formatPercent(mistakePercentage)} of your trades. This is your biggest area for improvement.`,
        })
      } else if (mistakePercentage > 15) {
        insights.push({
          type: 'warning',
          icon: Shield,
          title: 'Pattern to Watch',
          message: `"${topMistake.mistake}" is your most common mistake (${topMistake.count} occurrences). Work on reducing this.`,
        })
      }
    }
    
    // Strategy insight
    if (strategies.length > 0) {
      const profitableStrategies = strategies.filter(s => s.profit > 0 && s.trades >= 3)
      const unprofitableStrategies = strategies.filter(s => s.profit < 0 && s.trades >= 3)
      
      if (profitableStrategies.length > 0) {
        const best = profitableStrategies.sort((a, b) => b.profit - a.profit)[0]
        insights.push({
          type: 'success',
          icon: Target,
          title: 'Winning Strategy',
          message: `"${best.strategy}" is your most profitable strategy with ${formatCurrency(best.profit)} profit and ${formatPercent(best.winRate)} win rate. Consider focusing more on this approach.`,
        })
      }
      
      if (unprofitableStrategies.length > 0) {
        const worst = unprofitableStrategies.sort((a, b) => a.profit - b.profit)[0]
        insights.push({
          type: 'danger',
          icon: TrendingUp,
          title: 'Strategy Review Needed',
          message: `"${worst.strategy}" is losing you money (${formatCurrency(worst.profit)}). Either refine this strategy or stop using it.`,
        })
      }
    }
    
    // Win rate insight
    if (stats.winRate < 40 && trades.length >= 10) {
      insights.push({
        type: 'danger',
        icon: Target,
        title: 'Win Rate Alert',
        message: `Your win rate of ${formatPercent(stats.winRate)} is below average. Focus on quality setups over quantity.`,
      })
    } else if (stats.winRate >= 60) {
      insights.push({
        type: 'success',
        icon: Zap,
        title: 'Strong Performance',
        message: `Excellent win rate of ${formatPercent(stats.winRate)}! Keep maintaining your trading discipline.`,
      })
    }
    
    // Risk-reward insight
    if (stats.averageRiskReward < 1 && trades.length >= 5) {
      insights.push({
        type: 'warning',
        icon: Shield,
        title: 'Risk Management',
        message: `Your average R:R is ${stats.averageRiskReward.toFixed(2)}:1. You're risking more than you stand to gain. Aim for at least 1:1.5.`,
      })
    }
    
    // Streak insight
    if (streaks.disciplineStreak >= 7) {
      insights.push({
        type: 'success',
        icon: Sun,
        title: 'Discipline Champion',
        message: `${streaks.disciplineStreak} days without revenge trading or FOMO entries. Outstanding self-control!`,
      })
    }
    
    if (streaks.currentLossStreak >= 3) {
      insights.push({
        type: 'danger',
        icon: AlertTriangle,
        title: 'Loss Streak Warning',
        message: `You're on a ${streaks.currentLossStreak} trade losing streak. Take a break and review your recent trades before continuing.`,
      })
    }
    
    // General tip if few insights
    if (insights.length < 2) {
      insights.push({
        type: 'info',
        icon: Lightbulb,
        title: 'Keep Going',
        message: 'Continue logging your trades with detailed notes and tags. More data means better insights!',
      })
    }
    
    return insights
  }
  
  const insights = generateInsights()

  // Generate trading profile
  const generateProfile = () => {
    if (trades.length < 5) return null
    
    const profile: { trait: string; score: number; description: string }[] = []
    
    // Discipline score
    const disciplineScore = Math.min(100, (streaks.disciplineStreak / 30) * 100)
    profile.push({
      trait: 'Discipline',
      score: disciplineScore,
      description: disciplineScore >= 70 ? 'Excellent self-control' : disciplineScore >= 40 ? 'Room for improvement' : 'Needs work',
    })
    
    // Risk management score
    const riskScore = Math.min(100, stats.averageRiskReward * 33.3)
    profile.push({
      trait: 'Risk Management',
      score: riskScore,
      description: riskScore >= 66 ? 'Good R:R ratios' : riskScore >= 33 ? 'Average' : 'Risking too much',
    })
    
    // Consistency score
    const consistencyScore = Math.min(100, stats.winRate * 1.5)
    profile.push({
      trait: 'Consistency',
      score: consistencyScore,
      description: consistencyScore >= 70 ? 'Very consistent' : consistencyScore >= 40 ? 'Moderate' : 'Inconsistent',
    })
    
    // Patience score (based on avoiding FOMO/revenge trades)
    const fomoCount = mistakes.find(m => m.mistake === 'FOMO Entry')?.count || 0
    const revengeCount = mistakes.find(m => m.mistake === 'Revenge Trading')?.count || 0
    const impulsivePercentage = ((fomoCount + revengeCount) / trades.length) * 100
    const patienceScore = Math.max(0, 100 - (impulsivePercentage * 5))
    profile.push({
      trait: 'Patience',
      score: patienceScore,
      description: patienceScore >= 70 ? 'Patient trader' : patienceScore >= 40 ? 'Sometimes impulsive' : 'Too impulsive',
    })
    
    return profile
  }
  
  const profile = generateProfile()

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Personalized Insights
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight, index) => (
            <Card 
              key={index}
              className={cn(
                "relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50",
                insight.type === 'success' && "border-success/30",
                insight.type === 'warning' && "border-warning/30",
                insight.type === 'danger' && "border-destructive/30",
                insight.type === 'info' && "border-primary/30"
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-20",
                insight.type === 'success' && "from-success/20 to-transparent",
                insight.type === 'warning' && "from-warning/20 to-transparent",
                insight.type === 'danger' && "from-destructive/20 to-transparent",
                insight.type === 'info' && "from-primary/20 to-transparent"
              )} />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <insight.icon className={cn(
                    "h-5 w-5",
                    insight.type === 'success' && "text-success",
                    insight.type === 'warning' && "text-warning",
                    insight.type === 'danger' && "text-destructive",
                    insight.type === 'info' && "text-primary"
                  )} />
                  {insight.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">{insight.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Trading Profile */}
      {profile && (
        <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Your Trading Profile
            </CardTitle>
            <CardDescription>
              Based on your trading history
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {profile.map((trait) => (
                <div key={trait.trait} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{trait.trait}</span>
                    <span className="text-sm text-muted-foreground">{Math.round(trait.score)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        trait.score >= 70 ? "bg-success" : trait.score >= 40 ? "bg-warning" : "bg-destructive"
                      )}
                      style={{ width: `${trait.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{trait.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Tips */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Trading Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { tip: 'Never risk more than 1-2% per trade', badge: 'Risk' },
              { tip: 'Wait for your setup, never force trades', badge: 'Patience' },
              { tip: 'Always use a stop loss', badge: 'Protection' },
              { tip: 'Keep a trading journal religiously', badge: 'Discipline' },
              { tip: 'Review your trades weekly', badge: 'Growth' },
              { tip: 'Take breaks after losing streaks', badge: 'Psychology' },
            ].map((item, i) => (
              <div 
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
              >
                <Badge variant="outline" className="shrink-0 text-xs">
                  {item.badge}
                </Badge>
                <span className="text-sm">{item.tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

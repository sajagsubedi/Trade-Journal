import type { Trade, TradeStats, TradingSession } from './types'
import { SUPPORTED_CURRENCIES } from './types'

const SESSION_LABELS: Record<TradingSession, string> = {
  london: 'London',
  new_york: 'New York',
  tokyo: 'Tokyo',
  sydney: 'Sydney',
  overlap: 'Overlap',
}

export function getSessionLabel(session: TradingSession): string {
  return SESSION_LABELS[session] || session
}

export function getCurrencySymbol(currency = 'USD'): string {
  const found = SUPPORTED_CURRENCIES.find((c) => c.code === currency)
  return found?.symbol ?? currency
}

export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))

  return amount < 0 ? `-${formatted}` : amount > 0 ? `+${formatted}` : formatted
}

export function formatCompactCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

export function formatCurrencyAxis(
  value: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  if (Math.abs(value) >= 1000) {
    return formatCompactCurrency(value, currency, locale)
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calculateProfitLoss(
  type: 'buy' | 'sell',
  entryPrice: number,
  exitPrice: number,
  lotSize: number
): number {
  const priceDiff = type === 'buy' ? exitPrice - entryPrice : entryPrice - exitPrice
  // Simplified P/L calculation (for forex, this would depend on pip value)
  return priceDiff * lotSize * 100
}

export function determineTradeResult(profitLoss: number): 'win' | 'loss' | 'breakeven' {
  if (profitLoss > 0) return 'win'
  if (profitLoss < 0) return 'loss'
  return 'breakeven'
}

export function generateAIInsights(trades: Trade[], stats: TradeStats): string {
  if (trades.length === 0) {
    return "I don't have any trades to analyze yet. Start logging your trades and I'll provide insights!"
  }

  const insights: string[] = []

  // Win rate analysis
  if (stats.winRate >= 60) {
    insights.push(`Great job! Your win rate of ${stats.winRate.toFixed(1)}% is above average.`)
  } else if (stats.winRate >= 50) {
    insights.push(`Your win rate is ${stats.winRate.toFixed(1)}%. There's room for improvement.`)
  } else {
    insights.push(`Your win rate of ${stats.winRate.toFixed(1)}% needs attention. Consider reviewing your entry criteria.`)
  }

  // Risk-reward analysis
  if (stats.averageRiskReward >= 2) {
    insights.push(`Excellent risk-reward ratio of ${stats.averageRiskReward.toFixed(2)}:1!`)
  } else if (stats.averageRiskReward >= 1) {
    insights.push(`Your risk-reward ratio is ${stats.averageRiskReward.toFixed(2)}:1. Consider aiming for 2:1 or higher.`)
  } else {
    insights.push(`Your risk-reward ratio of ${stats.averageRiskReward.toFixed(2)}:1 is concerning. You're risking more than you stand to gain.`)
  }

  // Profit/Loss analysis
  if (stats.totalProfitLoss > 0) {
    insights.push(`You're in profit with a total of ${formatCurrency(stats.totalProfitLoss)}.`)
  } else if (stats.totalProfitLoss < 0) {
    insights.push(`You're currently at a loss of ${formatCurrency(stats.totalProfitLoss)}. Review your losing trades for patterns.`)
  }

  // Common mistakes
  const mistakeCounts: Record<string, number> = {}
  trades.forEach((trade) => {
    trade.mistakes.forEach((mistake) => {
      mistakeCounts[mistake] = (mistakeCounts[mistake] || 0) + 1
    })
  })
  
  const topMistakes = Object.entries(mistakeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  if (topMistakes.length > 0) {
    insights.push(`Your most common mistakes are: ${topMistakes.map(([m]) => m).join(', ')}.`)
  }

  // Best performing strategy
  const strategyStats: Record<string, { wins: number; total: number }> = {}
  trades.forEach((trade) => {
    const strategy = trade.strategy || 'Unknown'
    if (!strategyStats[strategy]) {
      strategyStats[strategy] = { wins: 0, total: 0 }
    }
    strategyStats[strategy].total++
    if (trade.result === 'win') strategyStats[strategy].wins++
  })

  const bestStrategy = Object.entries(strategyStats)
    .filter(([, s]) => s.total >= 3)
    .sort(([, a], [, b]) => (b.wins / b.total) - (a.wins / a.total))[0]

  if (bestStrategy) {
    const [name, data] = bestStrategy
    const winRate = ((data.wins / data.total) * 100).toFixed(1)
    insights.push(`Your best performing strategy is "${name}" with a ${winRate}% win rate.`)
  }

  return insights.join('\n\n')
}

export function analyzeQuestion(question: string, trades: Trade[], stats: TradeStats): string {
  const q = question.toLowerCase()

  if (q.includes('last') && (q.includes('trade') || q.includes('10'))) {
    const lastTrades = trades.slice(0, 10)
    if (lastTrades.length === 0) return "You haven't logged any trades yet."
    
    const wins = lastTrades.filter((t) => t.result === 'win').length
    const losses = lastTrades.filter((t) => t.result === 'loss').length
    const totalPL = lastTrades.reduce((sum, t) => sum + t.profitLoss, 0)
    
    return `Analysis of your last ${lastTrades.length} trades:\n\n` +
      `- Wins: ${wins}\n` +
      `- Losses: ${losses}\n` +
      `- Total P/L: ${formatCurrency(totalPL)}\n` +
      `- Win Rate: ${((wins / lastTrades.length) * 100).toFixed(1)}%\n\n` +
      `${wins > losses ? 'Good performance! Keep up the discipline.' : 'Consider reviewing your entry and exit criteria.'}`
  }

  if (q.includes('why') && q.includes('losing')) {
    const losingTrades = trades.filter((t) => t.result === 'loss')
    if (losingTrades.length === 0) return "Great news! You don't have any losing trades recorded."
    
    const mistakeCounts: Record<string, number> = {}
    losingTrades.forEach((trade) => {
      trade.mistakes.forEach((mistake) => {
        mistakeCounts[mistake] = (mistakeCounts[mistake] || 0) + 1
      })
    })
    
    const sortedMistakes = Object.entries(mistakeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    
    if (sortedMistakes.length === 0) {
      return "Your losing trades don't have recorded mistakes. Consider tagging mistakes to identify patterns."
    }
    
    return `Based on your ${losingTrades.length} losing trades, here are the main issues:\n\n` +
      sortedMistakes.map(([mistake, count]) => `- ${mistake}: ${count} occurrences`).join('\n') +
      `\n\nFocus on addressing "${sortedMistakes[0][0]}" first, as it's your most frequent mistake.`
  }

  if (q.includes('mistake')) {
    const mistakeCounts: Record<string, number> = {}
    trades.forEach((trade) => {
      trade.mistakes.forEach((mistake) => {
        mistakeCounts[mistake] = (mistakeCounts[mistake] || 0) + 1
      })
    })
    
    const sortedMistakes = Object.entries(mistakeCounts)
      .sort(([, a], [, b]) => b - a)
    
    if (sortedMistakes.length === 0) {
      return "No mistakes recorded yet. Keep logging your trades with mistake tags for better insights."
    }
    
    return `Your trading mistakes breakdown:\n\n` +
      sortedMistakes.map(([mistake, count]) => `- ${mistake}: ${count} times`).join('\n') +
      `\n\nTotal unique mistakes: ${sortedMistakes.length}`
  }

  if (q.includes('best') && q.includes('strateg')) {
    const strategyStats: Record<string, { wins: number; total: number; profit: number }> = {}
    trades.forEach((trade) => {
      const strategy = trade.strategy || 'Unknown'
      if (!strategyStats[strategy]) {
        strategyStats[strategy] = { wins: 0, total: 0, profit: 0 }
      }
      strategyStats[strategy].total++
      strategyStats[strategy].profit += trade.profitLoss
      if (trade.result === 'win') strategyStats[strategy].wins++
    })
    
    const sorted = Object.entries(strategyStats)
      .sort(([, a], [, b]) => b.profit - a.profit)
    
    if (sorted.length === 0) {
      return "No strategies recorded yet. Tag your trades with strategies for analysis."
    }
    
    return `Strategy performance:\n\n` +
      sorted.map(([strategy, data]) => 
        `- ${strategy}: ${formatCurrency(data.profit)} | ${((data.wins / data.total) * 100).toFixed(1)}% win rate | ${data.total} trades`
      ).join('\n')
  }

  // Default response
  return generateAIInsights(trades, stats)
}

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Trade, TradeFilters, ChatMessage, TradeStats, UserSettings, Alert, TradingSession } from '@/lib/types'
import { DEFAULT_USER_SETTINGS } from '@/lib/types'

interface TradeState {
  trades: Trade[]
  filters: TradeFilters
  chatMessages: ChatMessage[]
  settings: UserSettings
  alerts: Alert[]
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Data sync
  fetchTrades: () => Promise<void>
  fetchSettings: () => Promise<void>
  initializeData: () => Promise<void>
  resetStore: () => void

  // Trade actions
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Trade | null>
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<boolean>
  deleteTrade: (id: string) => Promise<boolean>
  importTrades: (trades: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<number>
  clearAllTrades: () => Promise<boolean>

  // Filter actions
  setFilters: (filters: Partial<TradeFilters>) => void
  resetFilters: () => void

  // Chat actions
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearChatMessages: () => void

  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => Promise<boolean>

  // Alert actions
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'dismissed'>) => void
  dismissAlert: (id: string) => void
  clearAlerts: () => void
  getActiveAlerts: () => Alert[]

  // Computed
  getFilteredTrades: () => Trade[]
  getStats: () => TradeStats
  getEquityCurve: () => { date: string; equity: number }[]
  getDailyPerformance: () => { date: string; profit: number; trades: number }[]
  getWeeklyPerformance: () => { week: string; profit: number; trades: number }[]
  getStrategyPerformance: () => { strategy: string; winRate: number; profit: number; trades: number }[]
  getMistakeFrequency: () => { mistake: string; count: number }[]
  getSessionPerformance: () => { session: TradingSession; winRate: number; profit: number; trades: number }[]
  getBestSession: () => { session: TradingSession; winRate: number } | null
  getStreaks: () => { currentWinStreak: number; currentLossStreak: number; bestWinStreak: number; disciplineStreak: number }
  getTodayStats: () => { trades: number; profit: number; riskUsed: number }
  getCalendarData: () => { date: string; trades: number; profit: number; result: 'positive' | 'negative' | 'neutral' }[]
}

const defaultFilters: TradeFilters = {
  pair: 'all',
  result: 'all',
  strategy: 'all',
  dateFrom: '',
  dateTo: '',
}

const defaultSettings: UserSettings = { ...DEFAULT_USER_SETTINGS }

const generateId = () => Math.random().toString(36).substring(2, 15)

const computedMethods = (
  set: (partial: Partial<TradeState> | ((state: TradeState) => Partial<TradeState>)) => void,
  get: () => TradeState
) => ({
  getFilteredTrades: () => {
    const { trades, filters } = get()
    return trades.filter((trade) => {
      if (filters.pair !== 'all' && trade.pair !== filters.pair) return false
      if (filters.result !== 'all' && trade.result !== filters.result) return false
      if (filters.strategy !== 'all' && trade.strategy !== filters.strategy) return false
      if (filters.dateFrom && new Date(trade.dateTime) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && new Date(trade.dateTime) > new Date(filters.dateTo)) return false
      return true
    }).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
  },

  getStats: () => {
    const trades = get().getFilteredTrades()
    const winningTrades = trades.filter((t) => t.result === 'win').length
    const losingTrades = trades.filter((t) => t.result === 'loss').length
    const breakevenTrades = trades.filter((t) => t.result === 'breakeven').length
    const totalTrades = trades.length

    const totalProfitLoss = trades.reduce((sum, t) => sum + t.profitLoss, 0)
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    const avgRiskReward = trades.length > 0
      ? trades.reduce((sum, t) => {
          const risk = Math.abs(t.entryPrice - t.stopLoss)
          const reward = Math.abs(t.takeProfit - t.entryPrice)
          return sum + (risk > 0 ? reward / risk : 0)
        }, 0) / trades.length
      : 0

    const sortedByPL = [...trades].sort((a, b) => b.profitLoss - a.profitLoss)
    const bestTrade = sortedByPL[0] || null
    const worstTrade = sortedByPL[sortedByPL.length - 1] || null

    return {
      totalTrades,
      winRate,
      totalProfitLoss,
      averageRiskReward: avgRiskReward,
      bestTrade,
      worstTrade,
      winningTrades,
      losingTrades,
      breakevenTrades,
    }
  },

  getEquityCurve: () => {
    const trades = get().trades.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    )
    let equity = 10000
    return trades.map((trade) => {
      equity += trade.profitLoss
      return {
        date: new Date(trade.dateTime).toLocaleDateString(),
        equity,
      }
    })
  },

  getDailyPerformance: () => {
    const trades = get().getFilteredTrades()
    const dailyMap = new Map<string, { profit: number; trades: number }>()

    trades.forEach((trade) => {
      const date = new Date(trade.dateTime).toLocaleDateString()
      const existing = dailyMap.get(date) || { profit: 0, trades: 0 }
      dailyMap.set(date, {
        profit: existing.profit + trade.profitLoss,
        trades: existing.trades + 1,
      })
    })

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  },

  getWeeklyPerformance: () => {
    const trades = get().getFilteredTrades()
    const weeklyMap = new Map<string, { profit: number; trades: number }>()

    trades.forEach((trade) => {
      const date = new Date(trade.dateTime)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const week = weekStart.toLocaleDateString()
      const existing = weeklyMap.get(week) || { profit: 0, trades: 0 }
      weeklyMap.set(week, {
        profit: existing.profit + trade.profitLoss,
        trades: existing.trades + 1,
      })
    })

    return Array.from(weeklyMap.entries())
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
  },

  getStrategyPerformance: () => {
    const trades = get().getFilteredTrades()
    const strategyMap = new Map<string, { wins: number; total: number; profit: number }>()

    trades.forEach((trade) => {
      const strategy = trade.strategy || 'Unknown'
      const existing = strategyMap.get(strategy) || { wins: 0, total: 0, profit: 0 }
      strategyMap.set(strategy, {
        wins: existing.wins + (trade.result === 'win' ? 1 : 0),
        total: existing.total + 1,
        profit: existing.profit + trade.profitLoss,
      })
    })

    return Array.from(strategyMap.entries()).map(([strategy, data]) => ({
      strategy,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      profit: data.profit,
      trades: data.total,
    }))
  },

  getMistakeFrequency: () => {
    const trades = get().getFilteredTrades()
    const mistakeMap = new Map<string, number>()

    trades.forEach((trade) => {
      trade.mistakes.forEach((mistake) => {
        mistakeMap.set(mistake, (mistakeMap.get(mistake) || 0) + 1)
      })
    })

    return Array.from(mistakeMap.entries())
      .map(([mistake, count]) => ({ mistake, count }))
      .sort((a, b) => b.count - a.count)
  },

  getSessionPerformance: () => {
    const trades = get().getFilteredTrades()
    const sessionMap = new Map<TradingSession, { wins: number; total: number; profit: number }>()

    trades.forEach((trade) => {
      const session = trade.session || 'london'
      const existing = sessionMap.get(session) || { wins: 0, total: 0, profit: 0 }
      sessionMap.set(session, {
        wins: existing.wins + (trade.result === 'win' ? 1 : 0),
        total: existing.total + 1,
        profit: existing.profit + trade.profitLoss,
      })
    })

    return Array.from(sessionMap.entries()).map(([session, data]) => ({
      session,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      profit: data.profit,
      trades: data.total,
    }))
  },

  getBestSession: () => {
    const sessionPerf = get().getSessionPerformance()
    if (sessionPerf.length === 0) return null

    const best = sessionPerf.reduce((prev, current) =>
      current.winRate > prev.winRate ? current : prev
    )
    return { session: best.session, winRate: best.winRate }
  },

  getStreaks: () => {
    const trades = [...get().trades].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    )

    let currentWinStreak = 0
    let currentLossStreak = 0
    let bestWinStreak = 0
    let tempWinStreak = 0
    let tempLossStreak = 0

    trades.forEach((trade) => {
      if (trade.result === 'win') {
        tempWinStreak++
        tempLossStreak = 0
        if (tempWinStreak > bestWinStreak) {
          bestWinStreak = tempWinStreak
        }
      } else if (trade.result === 'loss') {
        tempLossStreak++
        tempWinStreak = 0
      }
    })

    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].result === 'win') {
        if (currentLossStreak === 0) currentWinStreak++
        else break
      } else if (trades[i].result === 'loss') {
        if (currentWinStreak === 0) currentLossStreak++
        else break
      }
    }

    const today = new Date()
    let disciplineStreak = 0
    const daySet = new Set<string>()

    trades.forEach((trade) => {
      const day = new Date(trade.dateTime).toDateString()
      const hasBadMistakes = trade.mistakes.some(m =>
        ['Revenge Trading', 'Overtrading', 'FOMO Entry'].includes(m)
      )
      if (hasBadMistakes) {
        daySet.add(day)
      }
    })

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toDateString()

      if (daySet.has(dateStr)) {
        break
      }
      disciplineStreak++
    }

    return { currentWinStreak, currentLossStreak, bestWinStreak, disciplineStreak }
  },

  getTodayStats: () => {
    const trades = get().trades
    const today = new Date().toDateString()

    const todayTrades = trades.filter(
      (trade) => new Date(trade.dateTime).toDateString() === today
    )

    const profit = todayTrades.reduce((sum, t) => sum + t.profitLoss, 0)
    const riskUsed = todayTrades.reduce((sum, t) => sum + t.riskPercent, 0)

    return { trades: todayTrades.length, profit, riskUsed }
  },

  getCalendarData: () => {
    const trades = get().trades
    const dailyMap = new Map<string, { trades: number; profit: number }>()

    trades.forEach((trade) => {
      const date = new Date(trade.dateTime).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || { trades: 0, profit: 0 }
      dailyMap.set(date, {
        trades: existing.trades + 1,
        profit: existing.profit + trade.profitLoss,
      })
    })

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        trades: data.trades,
        profit: data.profit,
        result: data.profit > 0 ? 'positive' as const : data.profit < 0 ? 'negative' as const : 'neutral' as const,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  },
})

export const useTradeStore = create<TradeState>()(
  persist(
    (set, get) => ({
      trades: [],
      filters: defaultFilters,
      chatMessages: [],
      settings: defaultSettings,
      alerts: [],
      isLoading: false,
      isInitialized: false,
      error: null,

      fetchTrades: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/trades')
          if (!res.ok) throw new Error('Failed to fetch trades')
          const data = await res.json()
          set({ trades: data.trades, isLoading: false })
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to fetch trades' })
        }
      },

      fetchSettings: async () => {
        try {
          const res = await fetch('/api/settings')
          if (!res.ok) throw new Error('Failed to fetch settings')
          const data = await res.json()
          set({ settings: { ...defaultSettings, ...data.settings } })
        } catch (error) {
          console.error('Failed to fetch settings:', error)
        }
      },

      initializeData: async () => {
        set({ isLoading: true, isInitialized: false })
        await Promise.all([get().fetchTrades(), get().fetchSettings()])
        set({ isLoading: false, isInitialized: true })
      },

      resetStore: () => {
        set({
          trades: [],
          settings: defaultSettings,
          filters: defaultFilters,
          chatMessages: [],
          alerts: [],
          isLoading: false,
          isInitialized: false,
          error: null,
        })
      },

      addTrade: async (tradeData) => {
        try {
          const res = await fetch('/api/trades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tradeData),
          })
          if (!res.ok) throw new Error('Failed to create trade')
          const data = await res.json()
          set((state) => ({ trades: [data.trade, ...state.trades] }))
          return data.trade
        } catch (error) {
          console.error('addTrade error:', error)
          return null
        }
      },

      updateTrade: async (id, tradeData) => {
        try {
          const res = await fetch(`/api/trades/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tradeData),
          })
          if (!res.ok) throw new Error('Failed to update trade')
          const data = await res.json()
          set((state) => ({
            trades: state.trades.map((trade) =>
              trade.id === id ? data.trade : trade
            ),
          }))
          return true
        } catch (error) {
          console.error('updateTrade error:', error)
          return false
        }
      },

      deleteTrade: async (id) => {
        try {
          const res = await fetch(`/api/trades/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed to delete trade')
          set((state) => ({
            trades: state.trades.filter((trade) => trade.id !== id),
          }))
          return true
        } catch (error) {
          console.error('deleteTrade error:', error)
          return false
        }
      },

      importTrades: async (tradesToImport) => {
        try {
          const res = await fetch('/api/trades/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trades: tradesToImport }),
          })
          if (!res.ok) throw new Error('Failed to import trades')
          const data = await res.json()
          set((state) => ({ trades: [...data.trades, ...state.trades] }))
          return data.count
        } catch (error) {
          console.error('importTrades error:', error)
          return 0
        }
      },

      clearAllTrades: async () => {
        try {
          const res = await fetch('/api/trades', { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed to clear trades')
          set({ trades: [] })
          return true
        } catch (error) {
          console.error('clearAllTrades error:', error)
          return false
        }
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }))
      },

      resetFilters: () => {
        set({ filters: defaultFilters })
      },

      addChatMessage: (messageData) => {
        const message: ChatMessage = {
          ...messageData,
          id: generateId(),
          timestamp: new Date().toISOString(),
        }
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        }))
      },

      clearChatMessages: () => {
        set({ chatMessages: [] })
      },

      updateSettings: async (newSettings) => {
        try {
          const res = await fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings),
          })
          if (!res.ok) throw new Error('Failed to update settings')
          const data = await res.json()
          set({ settings: { ...defaultSettings, ...data.settings } })
          return true
        } catch (error) {
          console.error('updateSettings error:', error)
          return false
        }
      },

      addAlert: (alertData) => {
        const alert: Alert = {
          ...alertData,
          id: generateId(),
          timestamp: new Date().toISOString(),
          dismissed: false,
        }
        set((state) => ({
          alerts: [...state.alerts, alert],
        }))
      },

      dismissAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === id ? { ...alert, dismissed: true } : alert
          ),
        }))
      },

      clearAlerts: () => {
        set({ alerts: [] })
      },

      getActiveAlerts: () => {
        return get().alerts.filter((alert) => !alert.dismissed)
      },

      ...computedMethods(set, get),
    }),
    {
      name: 'trade-journal-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
        chatMessages: state.chatMessages,
        alerts: state.alerts,
      }),
    }
  )
)

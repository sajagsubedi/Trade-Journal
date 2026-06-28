export type TradeType = 'buy' | 'sell'
export type TradeResult = 'win' | 'loss' | 'breakeven'
export type TradingSession = 'london' | 'new_york' | 'tokyo' | 'sydney' | 'overlap'

export interface Trade {
  id: string
  pair: string
  type: TradeType
  entryPrice: number
  exitPrice: number
  stopLoss: number
  takeProfit: number
  lotSize: number
  riskPercent: number
  result: TradeResult
  profitLoss: number
  dateTime: string
  session: TradingSession
  notes: string
  strategy: string
  mistakes: string[]
  tags: string[]
  chartScreenshot?: string
  createdAt: string
  updatedAt: string
}

export interface TradeFilters {
  pair: string
  result: TradeResult | 'all'
  strategy: string
  dateFrom: string
  dateTo: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface TradeStats {
  totalTrades: number
  winRate: number
  totalProfitLoss: number
  averageRiskReward: number
  bestTrade: Trade | null
  worstTrade: Trade | null
  winningTrades: number
  losingTrades: number
  breakevenTrades: number
}

export const CURRENCY_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 
  'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
  'XAU/USD', 'BTC/USD', 'ETH/USD', 'US30', 'NAS100', 'SPX500'
]

export const STRATEGIES = [
  'Scalping', 'Day Trading', 'Swing Trading', 'Position Trading',
  'Breakout', 'Trend Following', 'Range Trading', 'News Trading',
  'Price Action', 'Technical Analysis', 'Fundamental Analysis'
]

export const COMMON_MISTAKES = [
  'Overtrading', 'No Stop Loss', 'Moving Stop Loss', 'FOMO Entry',
  'Revenge Trading', 'Poor Risk Management', 'Early Exit', 'Late Entry',
  'Ignoring News', 'Trading Against Trend', 'Position Too Large',
  'Not Following Plan', 'Emotional Decision', 'Chasing Price'
]

export const TRADING_SESSIONS = [
  { value: 'tokyo', label: 'Tokyo (Asian)', hours: '00:00 - 09:00 UTC' },
  { value: 'london', label: 'London (European)', hours: '08:00 - 17:00 UTC' },
  { value: 'new_york', label: 'New York (American)', hours: '13:00 - 22:00 UTC' },
  { value: 'sydney', label: 'Sydney', hours: '22:00 - 07:00 UTC' },
  { value: 'overlap', label: 'Session Overlap', hours: 'Multiple Sessions' },
]

export const TRADE_TAGS = [
  'Breakout', 'Scalp', 'Swing', 'Reversal', 'Trend Continuation',
  'News Trade', 'Revenge Trade', 'Impulse', 'Planned', 'High Confidence',
  'Low Confidence', 'Experimental', 'A+ Setup'
]

export interface UserSettings {
  dailyRiskLimit: number
  maxTradesPerDay: number
  streakTarget: number
  currency: string
  locale: string
  accountSize: number
  minRiskReward: number
  weeklyRiskLimit: number
  monthlyProfitTarget: number
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyRiskLimit: 5,
  maxTradesPerDay: 5,
  streakTarget: 7,
  currency: 'USD',
  locale: 'en-US',
  accountSize: 10000,
  minRiskReward: 2,
  weeklyRiskLimit: 15,
  monthlyProfitTarget: 0,
}

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { code: 'NZD', label: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
] as const

export const SUPPORTED_LOCALES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'de-DE', label: 'German' },
  { code: 'fr-FR', label: 'French' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'en-IN', label: 'English (India)' },
] as const

export interface Alert {
  id: string
  type: 'warning' | 'danger' | 'success' | 'info'
  title: string
  message: string
  timestamp: string
  dismissed: boolean
}

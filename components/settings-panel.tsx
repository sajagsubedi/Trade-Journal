'use client'

import { useTradeStore } from '@/store/trade-store'
import { useFormatCurrency } from '@/hooks/use-currency'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import type { UserSettings } from '@/lib/types'
import { SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  Target,
  Flame,
  AlertTriangle,
  Trash2,
  Download,
  Upload,
  Database,
  Globe,
  Wallet,
  TrendingUp,
  Settings2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Numeric settings fields that get debounced text inputs
type NumericSettingKey =
  | 'accountSize'
  | 'monthlyProfitTarget'
  | 'dailyRiskLimit'
  | 'weeklyRiskLimit'
  | 'maxTradesPerDay'
  | 'minRiskReward'
  | 'streakTarget'

// Mirrors the server-side Zod schema bounds in /api/settings/route.ts.
// Used to avoid firing a debounced save with a value the API will reject —
// e.g. a momentary "0" while the user is clearing/retyping a field that
// requires min(1) or min(0.5).
const NUMERIC_BOUNDS: Record<NumericSettingKey, { min: number; max: number }> = {
  accountSize: { min: 0, max: 100_000_000 },
  monthlyProfitTarget: { min: 0, max: 100_000_000 },
  dailyRiskLimit: { min: 1, max: 100 },
  weeklyRiskLimit: { min: 1, max: 100 },
  maxTradesPerDay: { min: 1, max: 50 },
  minRiskReward: { min: 0.5, max: 10 },
  streakTarget: { min: 1, max: 365 },
}

export function SettingsPanel() {
  const settings = useTradeStore((state) => state.settings)
  const updateSettings = useTradeStore((state) => state.updateSettings)
  const trades = useTradeStore((state) => state.trades)
  const importTrades = useTradeStore((state) => state.importTrades)
  const clearAllTrades = useTradeStore((state) => state.clearAllTrades)
  const fetchTrades = useTradeStore((state) => state.fetchTrades)
  const { format } = useFormatCurrency()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // --- Local draft state for numeric inputs -------------------------------
  // Stored as strings so the input can be empty or mid-edit (e.g. "0.", "-")
  // without fighting React's controlled-input value. Parsed on demand.
  const toStringDraft = (s: UserSettings) => ({
    accountSize: String(s.accountSize),
    monthlyProfitTarget: String(s.monthlyProfitTarget),
    dailyRiskLimit: String(s.dailyRiskLimit),
    weeklyRiskLimit: String(s.weeklyRiskLimit),
    maxTradesPerDay: String(s.maxTradesPerDay),
    minRiskReward: String(s.minRiskReward),
    streakTarget: String(s.streakTarget),
  })

  const [draft, setDraft] = useState<Record<NumericSettingKey, string>>(() =>
    toStringDraft(settings)
  )

  // Keep local drafts in sync if settings change from elsewhere
  // (e.g. after import, or load from server).
  useEffect(() => {
    setDraft(toStringDraft(settings))
  }, [
    settings.accountSize,
    settings.monthlyProfitTarget,
    settings.dailyRiskLimit,
    settings.weeklyRiskLimit,
    settings.maxTradesPerDay,
    settings.minRiskReward,
    settings.streakTarget,
  ])

  const handleSettingChange = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    const success = await updateSettings({ [key]: value })
    if (success) {
      toast.success('Settings saved')
    } else {
      toast.error('Failed to save settings')
    }
  }

  // Debounced persist — only fires 400ms after the user stops typing
  const debouncedSave = useDebouncedCallback(
    <K extends NumericSettingKey>(key: K, value: UserSettings[K]) => {
      handleSettingChange(key, value)
    },
    400
  )

  const parseNumeric = (key: NumericSettingKey, rawValue: string): number => {
    return key === 'maxTradesPerDay' || key === 'streakTarget'
      ? parseInt(rawValue, 10)
      : parseFloat(rawValue)
  }

  // Updates local draft immediately (so the input feels responsive — the
  // user can freely type, clear, or backspace) and only schedules the
  // debounced save when the current value is fully valid per the server's
  // bounds. This avoids firing a request mid-typing (e.g. a momentary "0"
  // while clearing a min(1) field) that would just 400.
  const handleNumericChange = (key: NumericSettingKey, rawValue: string) => {
    setDraft((prev) => ({ ...prev, [key]: rawValue }))

    const parsed = parseNumeric(key, rawValue)
    if (Number.isNaN(parsed)) return // empty/incomplete — wait for more input

    const { min, max } = NUMERIC_BOUNDS[key]
    if (parsed < min || parsed > max) return // out of range mid-edit — wait

    debouncedSave(key, parsed)
  }

  // On blur, snap any empty or out-of-range value back to a valid one so
  // the field never gets stuck invalid, and persist immediately.
  const handleNumericBlur = (key: NumericSettingKey, fallback: number) => {
    const parsed = parseNumeric(key, draft[key])
    const { min, max } = NUMERIC_BOUNDS[key]
    const value = Number.isNaN(parsed)
      ? fallback
      : Math.min(max, Math.max(min, parsed))

    setDraft((prev) => ({ ...prev, [key]: String(value) }))
    debouncedSave(key, value)
  }

  const handleExport = () => {
    const data = {
      trades,
      settings,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Journal data exported successfully')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.trades && Array.isArray(data.trades)) {
          const count = await importTrades(data.trades)
          if (count > 0) {
            if (data.settings) {
              await updateSettings(data.settings)
            }
            await fetchTrades()
            toast.success(`Imported ${count} trades successfully`)
          } else {
            toast.error('Failed to import trades')
          }
        } else {
          toast.error('Invalid backup file format')
        }
      } catch {
        toast.error('Failed to parse backup file')
      }
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to delete all your trading data? This cannot be undone.')) {
      setIsClearing(true)
      const success = await clearAllTrades()
      if (success) {
        toast.success('All trades deleted')
      } else {
        toast.error('Failed to delete trades')
      }
      setIsClearing(false)
    }
  }

  const totalPL = trades.reduce((sum, t) => sum + t.profitLoss, 0)
  const accountEquity = settings.accountSize + totalPL

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Account overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <CardContent className="relative p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Wallet className="h-4 w-4" />
              Account Size
            </div>
            <p className="text-2xl font-bold">{format(settings.accountSize)}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent" />
          <CardContent className="relative p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <TrendingUp className="h-4 w-4" />
              Total P/L
            </div>
            <p className={cn('text-2xl font-bold', totalPL >= 0 ? 'text-success' : 'text-destructive')}>
              {format(totalPL)}
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
          <CardContent className="relative p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Target className="h-4 w-4" />
              Equity
            </div>
            <p className="text-2xl font-bold">{format(accountEquity)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Display & Currency */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            Display & Currency
          </CardTitle>
          <CardDescription>
            Choose how monetary values are displayed across the app
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Display Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => handleSettingChange('currency', value)}
              >
                <SelectTrigger className="w-full bg-input/50 border-border/50">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} — {c.label} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                All profit/loss values will use this currency format
              </p>
            </div>

            <div className="space-y-2">
              <Label>Number Format</Label>
              <Select
                value={settings.locale}
                onValueChange={(value) => handleSettingChange('locale', value)}
              >
                <SelectTrigger className="w-full bg-input/50 border-border/50">
                  <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LOCALES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Preview: {format(1234.56)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account & Goals */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Account & Goals
          </CardTitle>
          <CardDescription>
            Set your account size and profit targets for progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="accountSize">Starting Account Size</Label>
              <Input
                id="accountSize"
                type="number"
                min="0"
                step="100"
                value={draft.accountSize}
                onChange={(e) => handleNumericChange('accountSize', e.target.value)}
                onBlur={() => handleNumericBlur('accountSize', 0)}
                className="bg-input/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Used for equity calculations and risk percentages
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyProfitTarget">Monthly Profit Target</Label>
              <Input
                id="monthlyProfitTarget"
                type="number"
                min="0"
                step="50"
                value={draft.monthlyProfitTarget}
                onChange={(e) => handleNumericChange('monthlyProfitTarget', e.target.value)}
                onBlur={() => handleNumericBlur('monthlyProfitTarget', 0)}
                className="bg-input/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Shown as progress bar on the calendar page
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Risk Management
          </CardTitle>
          <CardDescription>
            Set your daily risk limits and trading discipline rules
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dailyRiskLimit" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Daily Risk Limit (%)
              </Label>
              <Input
                id="dailyRiskLimit"
                type="number"
                min="1"
                max="100"
                step="0.5"
                value={draft.dailyRiskLimit}
                onChange={(e) => handleNumericChange('dailyRiskLimit', e.target.value)}
                onBlur={() => handleNumericBlur('dailyRiskLimit', 5)}
                className="bg-input/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Max {format(settings.accountSize * settings.dailyRiskLimit / 100)} risk per day
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyRiskLimit" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Weekly Risk Limit (%)
              </Label>
              <Input
                id="weeklyRiskLimit"
                type="number"
                min="1"
                max="100"
                step="0.5"
                value={draft.weeklyRiskLimit}
                onChange={(e) => handleNumericChange('weeklyRiskLimit', e.target.value)}
                onBlur={() => handleNumericBlur('weeklyRiskLimit', 15)}
                className="bg-input/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Maximum weekly drawdown tolerance
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTrades" className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Max Trades Per Day
              </Label>
              <Input
                id="maxTrades"
                type="number"
                min="1"
                max="50"
                value={draft.maxTradesPerDay}
                onChange={(e) => handleNumericChange('maxTradesPerDay', e.target.value)}
                onBlur={() => handleNumericBlur('maxTradesPerDay', 5)}
                className="bg-input/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minRiskReward" className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Minimum Risk/Reward Ratio
              </Label>
              <Input
                id="minRiskReward"
                type="number"
                min="0.5"
                max="10"
                step="0.1"
                value={draft.minRiskReward}
                onChange={(e) => handleNumericChange('minRiskReward', e.target.value)}
                onBlur={() => handleNumericBlur('minRiskReward', 2)}
                className="bg-input/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Target at least {draft.minRiskReward}:1 on every trade
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="streakTarget" className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Discipline Streak Target (Days)
            </Label>
            <Input
              id="streakTarget"
              type="number"
              min="1"
              max="365"
              value={draft.streakTarget}
              onChange={(e) => handleNumericChange('streakTarget', e.target.value)}
              onBlur={() => handleNumericBlur('streakTarget', 7)}
              className="bg-input/50 border-border/50 max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Your goal for consecutive disciplined trading days
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, or clear your trading data stored in MongoDB
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Total Trades</p>
              <p className="text-sm text-muted-foreground">
                {trades.length} trades in your database
              </p>
            </div>
            <Badge variant="outline">{trades.length}</Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport} className="bg-input/50">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="bg-input/50"
              disabled={isImporting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </div>

          <div className="border-t border-border/50 pt-4 mt-4">
            <Button
              variant="destructive"
              onClick={handleClearAllData}
              className="w-full md:w-auto"
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? 'Deleting...' : 'Clear All Data'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will permanently delete all your trades from the database
            </p>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle>About Samir&apos;s Journal</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-sm text-muted-foreground">
            A professional trading journal designed to help you track, analyze, and improve your trading performance. Built with AI-powered insights and comprehensive analytics.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge>v2.1</Badge>
            <Badge variant="outline" className="gap-1">
              <Database className="h-3 w-3" />
              MongoDB
            </Badge>
            <Badge variant="outline">{settings.currency}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
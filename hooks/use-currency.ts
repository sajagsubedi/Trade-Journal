'use client'

import { useTradeStore } from '@/store/trade-store'
import {
  formatCurrency,
  formatCompactCurrency,
  formatCurrencyAxis,
  getCurrencySymbol,
} from '@/lib/helpers'

export function useFormatCurrency() {
  const currency = useTradeStore((s) => s.settings.currency)
  const locale = useTradeStore((s) => s.settings.locale)

  return {
    currency,
    locale,
    symbol: getCurrencySymbol(currency),
    format: (amount: number) => formatCurrency(amount, currency, locale),
    formatCompact: (amount: number) => formatCompactCurrency(amount, currency, locale),
    formatAxis: (value: number) => formatCurrencyAxis(value, currency, locale),
  }
}

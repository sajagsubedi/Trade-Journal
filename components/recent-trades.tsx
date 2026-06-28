'use client'

import Link from 'next/link'
import { useTradeStore } from '@/store/trade-store'
import { formatDateTime } from '@/lib/helpers'
import { useFormatCurrency } from '@/hooks/use-currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Trade } from '@/lib/types'

export function RecentTrades() {
  const { format: formatCurrency } = useFormatCurrency()
  const trades = useTradeStore((state) => state.trades)
  const recentTrades = [...trades]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5)

  const getResultBadge = (result: Trade['result']) => {
    switch (result) {
      case 'win':
        return <Badge className="bg-success/20 text-success border-success/30">Win</Badge>
      case 'loss':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Loss</Badge>
      case 'breakeven':
        return <Badge variant="outline">B/E</Badge>
    }
  }

  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
      <CardHeader className="relative flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Recent Trades</CardTitle>
        <Link href="/journal">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="relative">
        {recentTrades.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No trades yet</p>
            <Link href="/journal">
              <Button variant="outline" className="mt-4">
                Add your first trade
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTrades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    trade.type === 'buy' ? 'bg-success/20' : 'bg-destructive/20'
                  )}>
                    {trade.type === 'buy' ? (
                      <ArrowUpRight className="h-5 w-5 text-success" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trade.pair}</span>
                      {getResultBadge(trade.result)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(trade.dateTime)} | {trade.strategy}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "text-right font-medium",
                  trade.profitLoss > 0 ? 'text-success' : trade.profitLoss < 0 ? 'text-destructive' : ''
                )}>
                  {formatCurrency(trade.profitLoss)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { useTradeStore } from '@/store/trade-store'
import { CURRENCY_PAIRS, STRATEGIES } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { X } from 'lucide-react'

export function TradeFilters() {
  const { filters, setFilters, resetFilters } = useTradeStore()

  const hasActiveFilters = 
    filters.pair !== 'all' ||
    filters.result !== 'all' ||
    filters.strategy !== 'all' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== ''

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5 min-w-[150px]">
            <Label className="text-xs text-muted-foreground">Pair</Label>
            <Select
              value={filters.pair}
              onValueChange={(value) => setFilters({ pair: value })}
            >
              <SelectTrigger className="bg-input border-border h-9">
                <SelectValue placeholder="All pairs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pairs</SelectItem>
                {CURRENCY_PAIRS.map((pair) => (
                  <SelectItem key={pair} value={pair}>
                    {pair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 min-w-[120px]">
            <Label className="text-xs text-muted-foreground">Result</Label>
            <Select
              value={filters.result}
              onValueChange={(value) => setFilters({ result: value as typeof filters.result })}
            >
              <SelectTrigger className="bg-input border-border h-9">
                <SelectValue placeholder="All results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="win">Win</SelectItem>
                <SelectItem value="loss">Loss</SelectItem>
                <SelectItem value="breakeven">Breakeven</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 min-w-[150px]">
            <Label className="text-xs text-muted-foreground">Strategy</Label>
            <Select
              value={filters.strategy}
              onValueChange={(value) => setFilters({ strategy: value })}
            >
              <SelectTrigger className="bg-input border-border h-9">
                <SelectValue placeholder="All strategies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                {STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy} value={strategy}>
                    {strategy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ dateFrom: e.target.value })}
              className="bg-input border-border h-9 w-[140px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ dateTo: e.target.value })}
              className="bg-input border-border h-9 w-[140px]"
            />
          </div>

          {hasActiveFilters && (
            <div className="space-y-1.5 flex items-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

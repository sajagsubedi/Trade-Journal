'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard-shell'
import { TradeTable } from '@/components/trade-table'
import { TradeFilters } from '@/components/trade-filters'
import { TradeForm } from '@/components/trade-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Trade } from '@/lib/types'

export default function JournalPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTrade, setEditTrade] = useState<Trade | null>(null)

  const handleEditTrade = (trade: Trade) => {
    setEditTrade(trade)
    setFormOpen(true)
  }

  const handleCloseForm = (open: boolean) => {
    setFormOpen(open)
    if (!open) {
      setEditTrade(null)
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Trade Journal</h1>
          <p className="text-muted-foreground mt-1">
            Log and manage all your trades
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Add Trade
        </Button>
      </div>

      <div className="mb-6">
        <TradeFilters />
      </div>

      <TradeTable onEditTrade={handleEditTrade} />

      <TradeForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        editTrade={editTrade}
      />
    </DashboardShell>
  )
}

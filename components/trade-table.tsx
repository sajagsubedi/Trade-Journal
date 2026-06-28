'use client'

import React, {  useState } from 'react'
import { useTradeStore } from '@/store/trade-store'
import { formatDateTime, getSessionLabel } from '@/lib/helpers'
import { useFormatCurrency } from '@/hooks/use-currency'
import type { Trade } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MoreHorizontal, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Image as ImageIcon, Clock, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TradeTableProps {
  onEditTrade: (trade: Trade) => void
}

export function TradeTable({ onEditTrade }: TradeTableProps) {
  const { format: formatCurrency } = useFormatCurrency()
  const { getFilteredTrades, deleteTrade } = useTradeStore()
  const trades = getFilteredTrades()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewingChart, setViewingChart] = useState<string | null>(null)
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (deleteId) {
      setIsDeleting(true)
      const success = await deleteTrade(deleteId)
      if (success) {
        toast.success('Trade deleted successfully')
      } else {
        toast.error('Failed to delete trade')
      }
      setDeleteId(null)
      setIsDeleting(false)
    }
  }

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

  if (trades.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardContent className="relative py-12 text-center">
          <p className="text-muted-foreground">No trades found. Add your first trade to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="relative overflow-hidden bg-card/50 backdrop-blur-xl border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-sm font-medium">Trade Log ({trades.length} trades)</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Pair</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Session</TableHead>
                  <TableHead className="text-muted-foreground">Entry</TableHead>
                  <TableHead className="text-muted-foreground">Exit</TableHead>
                  <TableHead className="text-muted-foreground">Result</TableHead>
                  <TableHead className="text-muted-foreground">P/L</TableHead>
                  <TableHead className="text-muted-foreground">Strategy</TableHead>
                  <TableHead className="text-muted-foreground">Chart</TableHead>
                  <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
                  <React.Fragment key={trade.id}>
                    <TableRow 
                      key={trade.id} 
                      className={cn(
                        "border-border cursor-pointer transition-colors",
                        expandedTradeId === trade.id && "bg-muted/30"
                      )}
                      onClick={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id)}
                    >
                      <TableCell className="text-sm">
                        {formatDateTime(trade.dateTime)}
                      </TableCell>
                      <TableCell className="font-medium">{trade.pair}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {trade.type === 'buy' ? (
                            <ArrowUpRight className="h-4 w-4 text-success" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-destructive" />
                          )}
                          <span className={cn(
                            "text-sm capitalize",
                            trade.type === 'buy' ? 'text-success' : 'text-destructive'
                          )}>
                            {trade.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {trade.session ? getSessionLabel(trade.session) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{trade.entryPrice}</TableCell>
                      <TableCell className="font-mono text-sm">{trade.exitPrice}</TableCell>
                      <TableCell>{getResultBadge(trade.result)}</TableCell>
                      <TableCell className={cn(
                        "font-medium",
                        trade.profitLoss > 0 ? 'text-success' : trade.profitLoss < 0 ? 'text-destructive' : ''
                      )}>
                        {formatCurrency(trade.profitLoss)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {trade.strategy}
                      </TableCell>
                      <TableCell>
                        {trade.chartScreenshot ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingChart(trade.chartScreenshot || null)
                            }}
                          >
                            <ImageIcon className="h-4 w-4 text-primary" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditTrade(trade)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteId(trade.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {/* Expanded row for details */}
                    {expandedTradeId === trade.id && (
                      <TableRow key={`${trade.id}-expanded`} className="border-border bg-muted/20">
                        <TableCell colSpan={11} className="py-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            {/* Trade Details */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Trade Details</h4>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>Stop Loss: <span className="text-foreground font-mono">{trade.stopLoss}</span></p>
                                <p>Take Profit: <span className="text-foreground font-mono">{trade.takeProfit}</span></p>
                                <p>Lot Size: <span className="text-foreground">{trade.lotSize}</span></p>
                                <p>Risk: <span className="text-foreground">{trade.riskPercent}%</span></p>
                              </div>
                            </div>
                            
                            {/* Tags & Mistakes */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Tags & Mistakes</h4>
                              <div className="flex flex-wrap gap-1">
                                {trade.tags?.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                                {trade.mistakes?.map((mistake) => (
                                  <Badge key={mistake} variant="destructive" className="text-xs opacity-70">
                                    {mistake}
                                  </Badge>
                                ))}
                                {(!trade.tags?.length && !trade.mistakes?.length) && (
                                  <span className="text-xs text-muted-foreground">No tags or mistakes</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Notes */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Notes</h4>
                              <p className="text-xs text-muted-foreground">
                                {trade.notes || 'No notes added'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chart Viewer Dialog */}
      <Dialog open={!!viewingChart} onOpenChange={() => setViewingChart(null)}>
        <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle>Chart Screenshot</DialogTitle>
          </DialogHeader>
          {viewingChart && (
            <img 
              src={viewingChart} 
              alt="Trade chart" 
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

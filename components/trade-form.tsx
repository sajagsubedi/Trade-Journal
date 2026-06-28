'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTradeStore } from '@/store/trade-store'
import { calculateProfitLoss, determineTradeResult } from '@/lib/helpers'
import { CURRENCY_PAIRS, STRATEGIES, COMMON_MISTAKES, TRADING_SESSIONS, TRADE_TAGS, type Trade, type TradingSession } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { X, Upload, Image as ImageIcon, Mic, MicOff } from 'lucide-react'
import { toast } from 'sonner'

const tradeSchema = z.object({
  pair: z.string().min(1, 'Pair is required'),
  type: z.enum(['buy', 'sell']),
  entryPrice: z.number().positive('Entry price must be positive'),
  exitPrice: z.number().positive('Exit price must be positive'),
  stopLoss: z.number().positive('Stop loss must be positive'),
  takeProfit: z.number().positive('Take profit must be positive'),
  lotSize: z.number().positive('Lot size must be positive'),
  riskPercent: z.number().min(0).max(100, 'Risk must be between 0-100%'),
  dateTime: z.string().min(1, 'Date is required'),
  session: z.enum(['london', 'new_york', 'tokyo', 'sydney', 'overlap']),
  strategy: z.string().min(1, 'Strategy is required'),
  notes: z.string(),
})

type TradeFormData = z.infer<typeof tradeSchema>

interface TradeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTrade?: Trade | null
}

export function TradeForm({ open, onOpenChange, editTrade }: TradeFormProps) {
  const { addTrade, updateTrade } = useTradeStore()
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [chartScreenshot, setChartScreenshot] = useState<string | undefined>()
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      pair: 'EUR/USD',
      type: 'buy',
      entryPrice: 0,
      exitPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      lotSize: 0.01,
      riskPercent: 1,
      dateTime: new Date().toISOString().slice(0, 16),
      session: 'london',
      strategy: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (editTrade) {
      setValue('pair', editTrade.pair)
      setValue('type', editTrade.type)
      setValue('entryPrice', editTrade.entryPrice)
      setValue('exitPrice', editTrade.exitPrice)
      setValue('stopLoss', editTrade.stopLoss)
      setValue('takeProfit', editTrade.takeProfit)
      setValue('lotSize', editTrade.lotSize)
      setValue('riskPercent', editTrade.riskPercent)
      setValue('dateTime', editTrade.dateTime.slice(0, 16))
      setValue('session', editTrade.session || 'london')
      setValue('strategy', editTrade.strategy)
      setValue('notes', editTrade.notes)
      setSelectedMistakes(editTrade.mistakes)
      setSelectedTags(editTrade.tags || [])
      setChartScreenshot(editTrade.chartScreenshot)
    } else {
      reset()
      setSelectedMistakes([])
      setSelectedTags([])
      setChartScreenshot(undefined)
    }
  }, [editTrade, setValue, reset])

  const onSubmit = async (data: TradeFormData) => {
    setIsSubmitting(true)
    const profitLoss = calculateProfitLoss(data.type, data.entryPrice, data.exitPrice, data.lotSize)
    const result = determineTradeResult(profitLoss)

    const tradeData = {
      ...data,
      profitLoss,
      result,
      mistakes: selectedMistakes,
      tags: selectedTags,
      chartScreenshot,
      dateTime: new Date(data.dateTime).toISOString(),
    }

    if (editTrade) {
      const success = await updateTrade(editTrade.id, tradeData)
      if (success) {
        toast.success('Trade updated successfully')
        reset()
        setSelectedMistakes([])
        setSelectedTags([])
        setChartScreenshot(undefined)
        onOpenChange(false)
      } else {
        toast.error('Failed to update trade')
      }
    } else {
      const trade = await addTrade(tradeData)
      if (trade) {
        toast.success('Trade added successfully')
        reset()
        setSelectedMistakes([])
        setSelectedTags([])
        setChartScreenshot(undefined)
        onOpenChange(false)
      } else {
        toast.error('Failed to add trade')
      }
    }
    setIsSubmitting(false)
  }

  const toggleMistake = (mistake: string) => {
    setSelectedMistakes((prev) =>
      prev.includes(mistake)
        ? prev.filter((m) => m !== mistake)
        : [...prev, mistake]
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setChartScreenshot(reader.result as string)
        toast.success('Chart screenshot uploaded')
      }
      reader.readAsDataURL(file)
    }
  }

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('')
      
      const currentNotes = watch('notes')
      setValue('notes', currentNotes + ' ' + transcript)
    }

    recognition.onerror = () => {
      setIsRecording(false)
      toast.error('Voice recognition error')
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
    setIsRecording(true)
    toast.success('Listening... Speak your notes')
  }

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      toast.success('Voice recording stopped')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">{editTrade ? 'Edit Trade' : 'Add New Trade'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Pair */}
            <div className="space-y-2">
              <Label>Currency Pair</Label>
              <Select
                value={watch('pair')}
                onValueChange={(value) => setValue('pair', value)}
              >
                <SelectTrigger className="bg-input/50 border-border/50 backdrop-blur">
                  <SelectValue placeholder="Select pair" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_PAIRS.map((pair) => (
                    <SelectItem key={pair} value={pair}>
                      {pair}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pair && (
                <p className="text-xs text-destructive">{errors.pair.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Trade Type</Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value as 'buy' | 'sell')}
              >
                <SelectTrigger className="bg-input/50 border-border/50 backdrop-blur">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy (Long)</SelectItem>
                  <SelectItem value="sell">Sell (Short)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Session */}
            <div className="space-y-2">
              <Label>Trading Session</Label>
              <Select
                value={watch('session')}
                onValueChange={(value) => setValue('session', value as TradingSession)}
              >
                <SelectTrigger className="bg-input/50 border-border/50 backdrop-blur">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {TRADING_SESSIONS.map((session) => (
                    <SelectItem key={session.value} value={session.value}>
                      <span className="flex flex-col">
                        <span>{session.label}</span>
                        <span className="text-xs text-muted-foreground">{session.hours}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Strategy */}
            <div className="space-y-2">
              <Label>Strategy</Label>
              <Select
                value={watch('strategy')}
                onValueChange={(value) => setValue('strategy', value)}
              >
                <SelectTrigger className="bg-input/50 border-border/50 backdrop-blur">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {STRATEGIES.map((strategy) => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.strategy && (
                <p className="text-xs text-destructive">{errors.strategy.message}</p>
              )}
            </div>

            {/* Entry Price */}
            <div className="space-y-2">
              <Label>Entry Price</Label>
              <Input
                type="number"
                step="0.00001"
                {...register('entryPrice', { valueAsNumber: true })}
                className="bg-input/50 border-border/50 backdrop-blur"
              />
              {errors.entryPrice && (
                <p className="text-xs text-destructive">{errors.entryPrice.message}</p>
              )}
            </div>

            {/* Exit Price */}
            <div className="space-y-2">
              <Label>Exit Price</Label>
              <Input
                type="number"
                step="0.00001"
                {...register('exitPrice', { valueAsNumber: true })}
                className="bg-input/50 border-border/50 backdrop-blur"
              />
              {errors.exitPrice && (
                <p className="text-xs text-destructive">{errors.exitPrice.message}</p>
              )}
            </div>

            {/* Stop Loss */}
            <div className="space-y-2">
              <Label>Stop Loss</Label>
              <Input
                type="number"
                step="0.00001"
                {...register('stopLoss', { valueAsNumber: true })}
                className="bg-input/50 border-border/50 backdrop-blur"
              />
              {errors.stopLoss && (
                <p className="text-xs text-destructive">{errors.stopLoss.message}</p>
              )}
            </div>

            {/* Take Profit */}
            <div className="space-y-2">
              <Label>Take Profit</Label>
              <Input
                type="number"
                step="0.00001"
                {...register('takeProfit', { valueAsNumber: true })}
                className="bg-input/50 border-border/50 backdrop-blur"
              />
              {errors.takeProfit && (
                <p className="text-xs text-destructive">{errors.takeProfit.message}</p>
              )}
            </div>

            {/* Lot Size */}
            <div className="space-y-2">
              <Label>Lot Size</Label>
              <Input
                type="number"
                step="0.01"
                {...register('lotSize', { valueAsNumber: true })}
                className="bg-input/50 border-border/50 backdrop-blur"
              />
              {errors.lotSize && (
                <p className="text-xs text-destructive">{errors.lotSize.message}</p>
              )}
            </div>

            {/* Risk % */}
            <div className="space-y-2">
              <Label>Risk %</Label>
              <Input
                type="number"
                step="0.1"
                {...register('riskPercent', { valueAsNumber: true })}
                className="bg-input/50 border-border/50 backdrop-blur"
              />
              {errors.riskPercent && (
                <p className="text-xs text-destructive">{errors.riskPercent.message}</p>
              )}
            </div>

            {/* Date & Time */}
            <div className="space-y-2 col-span-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                {...register('dateTime')}
                className="bg-input/50 border-border/50 backdrop-blur"
              />
              {errors.dateTime && (
                <p className="text-xs text-destructive">{errors.dateTime.message}</p>
              )}
            </div>
          </div>

          {/* Chart Screenshot Upload */}
          <div className="space-y-2">
            <Label>Chart Screenshot</Label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="bg-input/50 border-border/50 backdrop-blur"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Chart
              </Button>
              {chartScreenshot && (
                <div className="relative">
                  <img
                    src={chartScreenshot}
                    alt="Chart"
                    className="h-16 w-24 object-cover rounded border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setChartScreenshot(undefined)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {!chartScreenshot && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <ImageIcon className="h-4 w-4" />
                  No chart uploaded
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {TRADE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Mistakes */}
          <div className="space-y-2">
            <Label>Mistakes (Optional)</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_MISTAKES.map((mistake) => (
                <Badge
                  key={mistake}
                  variant={selectedMistakes.includes(mistake) ? 'destructive' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleMistake(mistake)}
                >
                  {mistake}
                  {selectedMistakes.includes(mistake) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes with Voice Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Notes</Label>
              <Button
                type="button"
                variant={isRecording ? 'destructive' : 'outline'}
                size="sm"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className="h-8"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-1" />
                    Voice
                  </>
                )}
              </Button>
            </div>
            <Textarea
              {...register('notes')}
              placeholder="Add notes about your trade, psychology, market conditions..."
              className="bg-input/50 border-border/50 backdrop-blur min-h-[100px]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editTrade ? 'Update Trade' : 'Add Trade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

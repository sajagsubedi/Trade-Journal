'use client'

import { useState, useRef, useEffect } from 'react'
import { useTradeStore } from '@/store/trade-store'
import { analyzeQuestion } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { chatMessages, addChatMessage, trades, getStats } = useTradeStore()
  const stats = getStats()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    addChatMessage({ role: 'user', content: userMessage })

    setIsTyping(true)
    
    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate AI response based on trade data
    const aiResponse = analyzeQuestion(userMessage, trades, stats)
    
    addChatMessage({ role: 'assistant', content: aiResponse })
    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    'Analyze my last 10 trades',
    'Why am I losing?',
    'What mistakes do I make?',
    'What is my best strategy?',
  ]

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-300",
          "bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90",
          "glow-primary",
          isOpen && "rotate-90"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[380px] h-[500px] bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl z-50 flex flex-col animate-fade-in">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              Trade AI Assistant
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {chatMessages.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3 text-sm">
                      <p>Hi! I can help you analyze your trading performance. Ask me anything about your trades!</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground px-11">Try asking:</p>
                    <div className="flex flex-wrap gap-2 px-11">
                      {suggestedQuestions.map((q) => (
                        <Button
                          key={q}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1.5 px-2"
                          onClick={() => {
                            setInput(q)
                          }}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start gap-3",
                        message.role === 'user' && "flex-row-reverse"
                      )}
                    >
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        message.role === 'assistant' ? "bg-primary/20" : "bg-accent"
                      )}>
                        {message.role === 'assistant' ? (
                          <Bot className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-accent-foreground" />
                        )}
                      </div>
                      <div className={cn(
                        "rounded-lg p-3 text-sm max-w-[80%]",
                        message.role === 'assistant' 
                          ? "bg-secondary/50" 
                          : "bg-primary text-primary-foreground"
                      )}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="rounded-lg bg-secondary/50 p-3">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.1s]" />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about your trades..."
                  className="bg-input border-border"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSend} 
                  size="icon"
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

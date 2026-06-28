'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  TrendingUp,
  Menu,
  X,
  Calendar,
  Settings,
  LogOut,
  ChevronUp,
  Bot,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTradeStore } from '@/store/trade-store'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Trade Journal', icon: BookOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/ai-coach', label: 'AI Coach', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function getInitials(name?: string, username?: string) {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  if (username) return username.slice(0, 2).toUpperCase()
  return 'U'
}

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const resetStore = useTradeStore((s) => s.resetStore)

  const user = session?.user
  const initials = getInitials(user?.fullName, user?.username)
  const handleSignOut = async () => {
    resetStore()
    await signOut({ callbackUrl: '/signin' })
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-card/80 backdrop-blur-lg border border-border/50 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 bg-sidebar/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border/50 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Trade Journal
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Trading Analytics
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-accent/10 text-foreground shadow-sm border border-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-primary" : ""
                )} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User profile */}
        <div className="shrink-0 border-t border-sidebar-border/50 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-sidebar-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                <Avatar className="h-9 w-9 border border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xs font-semibold text-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{user?.username}
                  </p>
                </div>
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56 mb-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">@{user?.username}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" onClick={() => setIsOpen(false)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  )
}

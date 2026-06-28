'use client'

import { DashboardShell } from '@/components/dashboard-shell'
import { SettingsPanel } from '@/components/settings-panel'

export default function SettingsPage() {
  return (
    <DashboardShell showChatbot={false}>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure currency, account goals, risk limits, and journal preferences
        </p>
      </div>

      <SettingsPanel />
    </DashboardShell>
  )
}

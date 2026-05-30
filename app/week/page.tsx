'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { isThisWeek, localDateStr } from '@/lib/planning'
import { SlidePanel } from '@/components/layout/SlidePanel'
import { ActivityForm } from '@/components/forms/ActivityForm'
import type { Activity } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'

function getWeekDays(): Date[] {
  const today = new Date()
  const monday = new Date(today)
  const dayOfWeek = today.getDay()
  monday.setDate(today.getDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateStr(d: Date): string {
  return localDateStr(d)
}

const importanceColors: Record<string, string> = {
  high: 'border-urgent bg-urgent-bg',
  medium: 'border-warn bg-warn-bg',
  low: 'border-border bg-surface',
}

export default function WeekPage() {
  const { members, activities } = useStore()
  const [filter, setFilter] = useState<string>('all')
  const [editing, setEditing] = useState<Activity | null>(null)
  const days = getWeekDays()
  const today = toDateStr(new Date())

  const filtered = activities.filter((a) => {
    if (!isThisWeek(a.date)) return false
    if (filter !== 'all' && a.ownerId !== filter && a.relatedFamilyMemberId !== filter) return false
    return true
  })

  const overloadCounts: Record<string, Record<string, number>> = {}
  for (const a of filtered) {
    if (!a.date) continue
    overloadCounts[a.date] = overloadCounts[a.date] ?? {}
    overloadCounts[a.date][a.ownerId] = (overloadCounts[a.date][a.ownerId] ?? 0) + 1
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Week</h1>
          <p className="text-sm text-muted mt-0.5">A shared view of school, errands, routines, and family time.</p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {[{ id: 'all', name: 'All' }, ...members].map((m) => (
            <button key={m.id} onClick={() => setFilter(m.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === m.id ? 'bg-primary text-primary-fg border-primary' : 'border-border text-muted hover:border-primary'}`}>
              {'name' in m ? m.name : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-2 min-w-0">
        {days.map((day) => {
          const ds = toDateStr(day)
          const dayActivities = filtered.filter((a) => a.date === ds)
          const isToday = ds === today
          const hasOverload = Object.values(overloadCounts[ds] ?? {}).some((n) => n > 4)

          return (
            <div key={ds} className={`min-h-32 rounded-[var(--radius)] border p-2.5 space-y-1 ${isToday ? 'border-primary bg-surface' : 'border-border bg-bg'}`}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className={`text-[11px] font-medium uppercase tracking-wide ${isToday ? 'text-primary' : 'text-muted'}`}>
                    {day.toLocaleDateString('en-CA', { weekday: 'short' })}
                  </div>
                  <div className={`text-sm font-semibold leading-none ${isToday ? 'text-primary' : 'text-ink'}`}>
                    {day.getDate()}
                  </div>
                </div>
                {hasOverload && <AlertTriangle size={13} className="text-warn" />}
              </div>
              {dayActivities.map((a) => (
                <button key={a.id} onClick={() => setEditing(a)}
                  className={`w-full text-left text-[11px] px-1.5 py-1 rounded border truncate transition-colors hover:opacity-80 ${importanceColors[a.importance]} ${a.status === 'done' ? 'line-through opacity-50' : ''}`}>
                  {a.title}
                </button>
              ))}
            </div>
          )
        })}
      </div>

      <SlidePanel open={!!editing} onClose={() => setEditing(null)} title="Edit Activity">
        {editing && <ActivityForm initial={editing} onDone={() => setEditing(null)} />}
      </SlidePanel>
    </div>
  )
}

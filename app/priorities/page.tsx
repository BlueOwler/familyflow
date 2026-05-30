'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { getQuadrant } from '@/lib/planning'
import { SlidePanel } from '@/components/layout/SlidePanel'
import { ActivityForm } from '@/components/forms/ActivityForm'
import type { Activity } from '@/lib/types'
import type { EisenhowerQuadrant as Quadrant } from '@/lib/planning'

const quadrants: { id: Quadrant; label: string; sub: string; labelColor: string; bg: string; divider: string }[] = [
  { id: 'do-now',   label: 'Do Now',        sub: 'Urgent + Important',        labelColor: 'text-urgent',        bg: 'bg-urgent-bg',        divider: 'border-urgent/20' },
  { id: 'schedule', label: 'Schedule',      sub: 'Important, not urgent',     labelColor: 'text-status-active', bg: 'bg-status-active-bg', divider: 'border-status-active/20' },
  { id: 'delegate', label: 'Delegate',      sub: 'Urgent, not important',     labelColor: 'text-warn',          bg: 'bg-warn-bg',          divider: 'border-warn/20' },
  { id: 'drop',     label: 'Drop / Defer',  sub: 'Low urgency + importance',  labelColor: 'text-muted',         bg: 'bg-surface',          divider: 'border-border' },
]

const examples: Record<Quadrant, string[]> = {
  'do-now':   ['Overdue school deadlines', 'Child sick — doctor call', 'Utility bill past due'],
  'schedule': ['Child enrichment planning', 'Parent health checkups', 'Family vacation prep', 'Financial review'],
  'delegate': ['Routine errands', 'Admin tasks', 'Household maintenance calls'],
  'drop':     ['Low-priority admin', 'Vague "someday" tasks', 'Duplicate activities'],
}

export default function PrioritiesPage() {
  const { members, activities } = useStore()
  const [editing, setEditing] = useState<Activity | null>(null)

  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? id
  const active = activities.filter((a) => a.status !== 'done' && a.status !== 'skipped')
  const byQuadrant = (q: Quadrant) => active.filter((a) => getQuadrant(a) === q)

  return (
    <div className="px-4 py-6 space-y-4">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Priorities</h1>
        <p className="text-sm text-muted mt-0.5">Eisenhower matrix — what deserves your attention vs. what can wait</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quadrants.map((q) => {
          const items = byQuadrant(q.id)
          return (
            <div key={q.id} className={`rounded-[var(--radius)] border border-border p-4 space-y-3 ${q.bg}`}>
              <div>
                <h2 className={`text-sm font-semibold ${q.labelColor}`}>{q.label}</h2>
                <p className="text-xs text-muted">{q.sub}</p>
              </div>

              <div className="space-y-0">
                {items.map((a, i) => (
                  <button key={a.id} onClick={() => setEditing(a)}
                    className={`w-full text-left px-0 py-2.5 text-sm hover:opacity-70 transition-opacity duration-150 group ${
                      i < items.length - 1 ? `border-b ${q.divider}` : ''
                    }`}>
                    <div className="flex items-baseline gap-2">
                      <span className="flex-1 text-ink font-medium text-[13px] leading-snug">{a.title}</span>
                      <span className="text-[11px] text-muted shrink-0">{memberName(a.ownerId)}</span>
                    </div>
                    {(a.effort !== 'small' || a.dueDate) && (
                      <div className="flex gap-2 mt-0.5">
                        {a.effort !== 'small' && <span className="text-[11px] text-muted capitalize">{a.effort} effort</span>}
                        {a.dueDate && <span className="text-[11px] text-muted ml-auto">due {a.dueDate}</span>}
                      </div>
                    )}
                  </button>
                ))}

                {items.length === 0 && (
                  <div className="space-y-1.5 pt-1">
                    {examples[q.id].map((ex) => (
                      <p key={ex} className="text-xs text-muted/60 italic">{ex}</p>
                    ))}
                  </div>
                )}
              </div>
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

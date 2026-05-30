'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { isThisMonth } from '@/lib/planning'
import type { FamilyMember, Goal, GoalStatus, GoalHorizon } from '@/lib/types'
import { SlidePanel } from '@/components/layout/SlidePanel'
import { Plus, Flag } from 'lucide-react'

const horizonLabel: Record<GoalHorizon, string> = {
  'this-month': 'This month', 'quarter': 'Quarter', 'year': 'Year', 'long-term': 'Long-term',
}
const horizonColor: Record<GoalHorizon, string> = {
  'this-month': 'bg-urgent-bg text-urgent',
  'quarter': 'bg-status-exploring-bg text-status-exploring',
  'year': 'bg-status-seasonal-bg text-status-seasonal',
  'long-term': 'bg-surface text-muted',
}

function GoalForm({
  initial,
  members,
  addGoal,
  updateGoal,
  onDone,
}: {
  initial?: Partial<Goal>
  members: FamilyMember[]
  addGoal: (goal: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  onDone: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [memberId, setMemberId] = useState(initial?.relatedFamilyMemberId ?? '')
  const [horizon, setHorizon] = useState<GoalHorizon>(initial?.horizon ?? 'quarter')
  const [nextAction, setNextAction] = useState(initial?.nextAction ?? '')
  const [status, setStatus] = useState<GoalStatus>(initial?.status ?? 'active')
  const [desc, setDesc] = useState(initial?.description ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const data = { title, relatedFamilyMemberId: memberId || undefined, horizon, nextAction, status, linkedInterestIds: initial?.linkedInterestIds ?? [], description: desc || undefined }
    if (initial?.id) { updateGoal(initial.id, data) } else { addGoal(data) }
    onDone()
  }

  const inp = (v: string, s: (x: string) => void, props = {}) => (
    <input className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary" value={v} onChange={(e) => s(e.target.value)} {...props} />
  )
  const field = (label: string, el: React.ReactNode) => (
    <div className="space-y-1"><label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>{el}</div>
  )
  const sel = (v: string, s: (x: string) => void, opts: { value: string; label: string }[]) => (
    <select className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary" value={v} onChange={(e) => s(e.target.value)}>
      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field('Title *', inp(title, setTitle, { placeholder: 'Goal title', required: true }))}
      {field('Family Member', sel(memberId, setMemberId, [{ value: '', label: 'Family' }, ...members.map((m) => ({ value: m.id, label: m.name }))]))}
      {field('Horizon', sel(horizon, (v) => setHorizon(v as GoalHorizon), Object.entries(horizonLabel).map(([v, l]) => ({ value: v, label: l }))))}
      {field('Next Action', inp(nextAction, setNextAction, { placeholder: 'Concrete next step' }))}
      {field('Status', sel(status, (v) => setStatus(v as GoalStatus), ['active', 'paused', 'complete'].map((v) => ({ value: v, label: v }))))}
      {field('Description', <textarea className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary resize-none" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />)}
      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 py-2 bg-primary text-primary-fg rounded-[var(--radius)] text-sm font-medium hover:bg-primary-hover transition-colors">
          {initial?.id ? 'Save Changes' : 'Add Goal'}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2 border border-border rounded-[var(--radius)] text-sm text-muted hover:bg-surface-2 transition-colors">Cancel</button>
      </div>
    </form>
  )
}

export default function GoalsPage() {
  const { members, interests, activities, goals, addGoal, updateGoal } = useStore()
  const [filter, setFilter] = useState('all')
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [adding, setAdding] = useState(false)

  const memberName = (id?: string) => id ? (members.find((m) => m.id === id)?.name ?? id) : 'Family'

  const filtered = goals.filter((g) => {
    if (g.status === 'complete') return false
    if (filter !== 'all' && g.relatedFamilyMemberId !== filter) return false
    return true
  })

  const isNeglected = (g: Goal) =>
    !g.nextAction?.trim() ||
    !activities.some((a) => a.linkedGoalId === g.id && isThisMonth(a.date))

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Goals</h1>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-primary text-primary-fg rounded-[var(--radius)] hover:bg-primary-hover transition-colors">
          <Plus size={14} /> Add Goal
        </button>
      </div>

      <div className="flex gap-1 flex-wrap">
        {[{ id: 'all', name: 'All' }, ...members].map((m) => (
          <button key={m.id} onClick={() => setFilter(m.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === m.id ? 'bg-primary text-primary-fg border-primary' : 'border-border text-muted hover:border-primary'}`}>
            {'name' in m ? m.name : 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((g) => {
          const neglected = isNeglected(g)
          const linkedInterests = interests.filter((i) => g.linkedInterestIds.includes(i.id))

          return (
            <div key={g.id} onClick={() => setEditingGoal(g)}
              className={`p-4 rounded-[var(--radius)] border cursor-pointer hover:border-primary transition-colors space-y-3 ${neglected ? 'border-warn bg-warn-bg' : 'border-border bg-surface'}`}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink leading-snug">{g.title}</p>
                  <p className="text-xs text-muted mt-0.5">{memberName(g.relatedFamilyMemberId)}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${horizonColor[g.horizon]}`}>{horizonLabel[g.horizon]}</span>
              </div>

              {neglected && (
                <div className="flex items-center gap-1.5 text-xs text-warn">
                  <Flag size={11} />
                  {!g.nextAction?.trim() ? 'No next action defined' : 'No activity this month'}
                </div>
              )}

              {g.nextAction && (
                <p className="text-xs text-muted"><span className="font-medium">Next:</span> {g.nextAction}</p>
              )}

              {linkedInterests.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {linkedInterests.map((i) => (
                    <span key={i.id} className="text-[11px] px-1.5 py-0.5 bg-bg border border-border rounded text-muted">{i.title}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-muted px-3 py-4 bg-surface rounded-[var(--radius)] text-center col-span-2">No active goals.</p>
        )}
      </div>

      <SlidePanel open={adding} onClose={() => setAdding(false)} title="Add Goal">
        <GoalForm members={members} addGoal={addGoal} updateGoal={updateGoal} onDone={() => setAdding(false)} />
      </SlidePanel>
      <SlidePanel open={!!editingGoal} onClose={() => setEditingGoal(null)} title="Edit Goal">
        {editingGoal && <GoalForm initial={editingGoal} members={members} addGoal={addGoal} updateGoal={updateGoal} onDone={() => setEditingGoal(null)} />}
      </SlidePanel>
    </div>
  )
}

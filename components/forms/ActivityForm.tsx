'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Activity, ActivityCategory, ImportanceLevel, UrgencyLevel, EffortLevel, Recurrence, ActivityStatus } from '@/lib/types'

const categories: ActivityCategory[] = ['school','health','household','finance','errands','family-time','work','personal','enrichment','admin']

interface Props {
  initial?: Partial<Activity>
  onDone: () => void
}

const seg3 = (val: string, set: (v: string) => void, opts: string[]) => (
  <div className="flex rounded border border-border overflow-hidden text-sm">
    {opts.map((o) => (
      <button
        key={o}
        type="button"
        onClick={() => set(o)}
        className={`flex-1 py-1.5 capitalize transition-colors ${val === o ? 'bg-primary text-primary-fg' : 'bg-bg text-ink hover:bg-surface-2'}`}
      >
        {o}
      </button>
    ))}
  </div>
)

export function ActivityForm({ initial = {}, onDone }: Props) {
  const { members, interests, goals, addActivity, updateActivity } = useStore()
  const isEdit = !!initial.id

  const [title, setTitle] = useState(initial.title ?? '')
  const [ownerId, setOwnerId] = useState(initial.ownerId ?? members[0]?.id ?? '')
  const [relatedId, setRelatedId] = useState(initial.relatedFamilyMemberId ?? '')
  const [category, setCategory] = useState<ActivityCategory>(initial.category ?? 'personal')
  const [date, setDate] = useState(initial.date ?? '')
  const [dueDate, setDueDate] = useState(initial.dueDate ?? '')
  const [importance, setImportance] = useState<ImportanceLevel>(initial.importance ?? 'medium')
  const [urgency, setUrgency] = useState<UrgencyLevel>(initial.urgency ?? 'medium')
  const [effort, setEffort] = useState<EffortLevel>(initial.effort ?? 'medium')
  const [recurrence, setRecurrence] = useState<Recurrence>(initial.recurrence ?? 'none')
  const [status, setStatus] = useState<ActivityStatus>(initial.status ?? 'not-started')
  const [linkedInterestId, setLinkedInterestId] = useState(initial.linkedInterestId ?? '')
  const [linkedGoalId, setLinkedGoalId] = useState(initial.linkedGoalId ?? '')
  const [description, setDescription] = useState(initial.description ?? '')

  const field = (label: string, el: React.ReactNode) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>
      {el}
    </div>
  )

  const input = (value: string, onChange: (v: string) => void, props = {}) => (
    <input
      className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  )

  const select = (value: string, onChange: (v: string) => void, options: { value: string; label: string }[]) => (
    <select
      className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const data = {
      title: title.trim(), ownerId, relatedFamilyMemberId: relatedId || undefined,
      category, date: date || undefined, dueDate: dueDate || undefined,
      importance, urgency, effort, recurrence, status,
      linkedInterestId: linkedInterestId || undefined,
      linkedGoalId: linkedGoalId || undefined,
      description: description || undefined,
    }
    if (isEdit && initial.id) { updateActivity(initial.id, data) }
    else { addActivity(data) }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field('Title *', input(title, setTitle, { placeholder: 'Activity title', required: true }))}
      {field('Owner', select(ownerId, setOwnerId, members.map((m) => ({ value: m.id, label: m.name }))))}
      {field('Related Family Member', select(relatedId, setRelatedId, [{ value: '', label: 'None' }, ...members.map((m) => ({ value: m.id, label: m.name }))]))}
      {field('Category', select(category, (v) => setCategory(v as ActivityCategory), categories.map((c) => ({ value: c, label: c.replace('-', ' ') }))))}
      {field('Date', input(date, setDate, { type: 'date' }))}
      {field('Due Date', input(dueDate, setDueDate, { type: 'date' }))}
      {field('Importance', seg3(importance, (v) => setImportance(v as ImportanceLevel), ['low', 'medium', 'high']))}
      {field('Urgency', seg3(urgency, (v) => setUrgency(v as UrgencyLevel), ['low', 'medium', 'high']))}
      {field('Effort', seg3(effort, (v) => setEffort(v as EffortLevel), ['small', 'medium', 'large']))}
      {field('Recurrence', select(recurrence, (v) => setRecurrence(v as Recurrence), ['none','daily','weekly','monthly'].map((v) => ({ value: v, label: v }))))}
      {field('Status', select(status, (v) => setStatus(v as ActivityStatus), ['not-started','in-progress','done','skipped'].map((v) => ({ value: v, label: v.replace('-', ' ') }))))}
      {field('Linked Interest', select(linkedInterestId, setLinkedInterestId, [{ value: '', label: 'None' }, ...interests.map((i) => ({ value: i.id, label: i.title }))]))}
      {field('Linked Goal', select(linkedGoalId, setLinkedGoalId, [{ value: '', label: 'None' }, ...goals.map((g) => ({ value: g.id, label: g.title }))]))}
      {field('Notes', <textarea className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary resize-none" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />)}

      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 py-2 bg-primary text-primary-fg rounded-[var(--radius)] text-sm font-medium hover:bg-primary-hover transition-colors">
          {isEdit ? 'Save Changes' : 'Add Activity'}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2 border border-border rounded-[var(--radius)] text-sm text-muted hover:bg-surface-2 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

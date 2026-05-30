'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { localDateStr } from '@/lib/planning'
import type { Interest, InterestStatus, Intensity } from '@/lib/types'

interface Props {
  initial?: Partial<Interest>
  onDone: () => void
}

const seg = (val: string, set: (v: string) => void, opts: string[]) => (
  <div className="flex rounded border border-border overflow-hidden text-sm">
    {opts.map((o) => (
      <button key={o} type="button" onClick={() => set(o)}
        className={`flex-1 py-1.5 capitalize transition-colors ${val === o ? 'bg-primary text-primary-fg' : 'bg-bg text-ink hover:bg-surface-2'}`}>
        {o}
      </button>
    ))}
  </div>
)

export function InterestForm({ initial = {}, onDone }: Props) {
  const { members, addInterest, updateInterest } = useStore()
  const isEdit = !!initial.id

  const [title, setTitle] = useState(initial.title ?? '')
  const [familyMemberId, setFamilyMemberId] = useState(initial.familyMemberId ?? members[0]?.id ?? '')
  const [category, setCategory] = useState(initial.category ?? '')
  const [status, setStatus] = useState<InterestStatus>(initial.status ?? 'exploring')
  const [intensity, setIntensity] = useState<Intensity>(initial.intensity ?? 'medium')
  const [startDate, setStartDate] = useState(() => initial.startDate ?? localDateStr())
  const [reviewDate, setReviewDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return initial.reviewDate ?? localDateStr(d)
  })
  const [notes, setNotes] = useState(initial.notes ?? '')

  const field = (label: string, el: React.ReactNode) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>
      {el}
    </div>
  )

  const inp = (value: string, onChange: (v: string) => void, props = {}) => (
    <input className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary"
      value={value} onChange={(e) => onChange(e.target.value)} {...props} />
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const data = { title: title.trim(), familyMemberId, category, status, intensity, startDate, reviewDate, notes: notes || undefined }
    if (isEdit && initial.id) { updateInterest(initial.id, data) }
    else { addInterest(data) }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {field('Title *', inp(title, setTitle, { placeholder: 'Interest title', required: true }))}
      {field('Family Member', (
        <select className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary"
          value={familyMemberId} onChange={(e) => setFamilyMemberId(e.target.value)}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      ))}
      {field('Category', inp(category, setCategory, { placeholder: 'e.g. Sports, Arts, Technology' }))}
      {field('Status', seg(status, (v) => setStatus(v as InterestStatus), ['exploring', 'active', 'paused', 'seasonal', 'dropped']))}
      {field('Intensity', seg(intensity, (v) => setIntensity(v as Intensity), ['low', 'medium', 'high']))}
      {field('Start Date', inp(startDate, setStartDate, { type: 'date' }))}
      {field('Review Date', inp(reviewDate, setReviewDate, { type: 'date' }))}
      {field('Notes', <textarea className="w-full px-3 py-2 border border-border rounded-[var(--radius)] text-sm bg-bg text-ink focus:outline-none focus:border-primary resize-none" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />)}

      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 py-2 bg-primary text-primary-fg rounded-[var(--radius)] text-sm font-medium hover:bg-primary-hover transition-colors">
          {isEdit ? 'Save Changes' : 'Add Interest'}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2 border border-border rounded-[var(--radius)] text-sm text-muted hover:bg-surface-2 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

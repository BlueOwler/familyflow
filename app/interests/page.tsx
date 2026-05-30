'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { isPastReviewDate, isThisWeek } from '@/lib/planning'
import type { Interest, InterestStatus } from '@/lib/types'
import { SlidePanel } from '@/components/layout/SlidePanel'
import { InterestForm } from '@/components/forms/InterestForm'
import { fetchSuggestions } from '@/lib/suggestions'
import type { Suggestion } from '@/lib/types'
import { MoreHorizontal, Sparkles, Loader } from 'lucide-react'

const statusStyle: Record<InterestStatus, { bg: string; text: string; label: string }> = {
  active:    { bg: 'bg-status-active-bg',    text: 'text-status-active',    label: 'Active' },
  exploring: { bg: 'bg-status-exploring-bg', text: 'text-status-exploring', label: 'Exploring' },
  paused:    { bg: 'bg-status-paused-bg',    text: 'text-status-paused',    label: 'Paused' },
  seasonal:  { bg: 'bg-status-seasonal-bg',  text: 'text-status-seasonal',  label: 'Seasonal' },
  dropped:   { bg: 'bg-status-dropped-bg',   text: 'text-status-dropped',   label: 'Dropped' },
}

const intensityDots: Record<string, string> = {
  low: 'bg-border', medium: 'bg-warn', high: 'bg-status-active',
}

export default function InterestsPage() {
  const { members, interests, activities, addActivity, updateInterest } = useStore()
  const [activeTab, setActiveTab] = useState('all')
  const [editing, setEditing] = useState<Interest | null>(null)
  const [suggesting, setSuggesting] = useState<Interest | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [suggestError, setSuggestError] = useState('')

  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? id

  const filtered = interests.filter((i) =>
    activeTab === 'all' ? true : i.familyMemberId === activeTab
  )

  const linkedActivityCount = (id: string) =>
    activities.filter((a) => a.linkedInterestId === id && isThisWeek(a.date)).length

  const handleSuggest = async (interest: Interest) => {
    setSuggesting(interest)
    setSuggestions([])
    setSuggestError('')
    setLoadingSuggestions(true)
    try {
      const member = members.find((m) => m.id === interest.familyMemberId)!
      let coords: { lat: number; lng: number } | undefined
      if (navigator.geolocation) {
        coords = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => resolve(undefined as unknown as { lat: number; lng: number })
          )
        })
      }
      const results = await fetchSuggestions(interest, member, activities, coords)
      setSuggestions(results)
    } catch (e) {
      setSuggestError(e instanceof Error ? e.message : 'Failed to load suggestions.')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleAddSuggestion = (s: Suggestion) => {
    if (!suggesting) return
    addActivity({
      title: s.title, description: s.description, category: s.category, effort: s.effort,
      ownerId: suggesting.familyMemberId, linkedInterestId: suggesting.id,
      importance: 'medium', urgency: 'low', recurrence: 'none', status: 'not-started',
    })
    setSuggestions((prev) => prev.filter((x) => x.title !== s.title))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-semibold text-ink">Interests</h1>

      <div className="flex gap-1 flex-wrap">
        {[{ id: 'all', name: 'All' }, ...members].map((m) => (
          <button key={m.id} onClick={() => setActiveTab(m.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${'name' in m ? '' : ''}${activeTab === m.id ? 'bg-primary text-primary-fg border-primary' : 'border-border text-muted hover:border-primary'}`}>
            {'name' in m ? m.name : 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {filtered.map((interest) => {
          const st = statusStyle[interest.status]
          const overdue = isPastReviewDate(interest)
          const actCount = linkedActivityCount(interest.id)

          return (
            <div key={interest.id} className="px-3 py-3 bg-surface rounded-[var(--radius)] border border-border flex items-center gap-3 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-ink">{interest.title}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${st.bg} ${st.text} font-medium`}>{st.label}</span>
                  {overdue && <span className="text-[11px] px-2 py-0.5 rounded-full bg-urgent-bg text-urgent font-medium">Review overdue</span>}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted">{memberName(interest.familyMemberId)}</span>
                  <span className="text-xs text-muted">{interest.category}</span>
                  <span className={`w-2 h-2 rounded-full ${intensityDots[interest.intensity]}`} title={`${interest.intensity} intensity`} />
                  {actCount > 0 && <span className="text-xs text-muted">{actCount} this week</span>}
                  <span className="text-xs text-muted ml-auto">Review {interest.reviewDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleSuggest(interest)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-border text-muted hover:border-primary hover:text-ink transition-colors">
                  <Sparkles size={12} /> Suggest
                </button>
                <button onClick={() => setEditing(interest)}
                  className="text-muted hover:text-ink p-1 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div className="flex gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-0">
                {(['active', 'paused', 'dropped'] as const).map((s) => (
                  <button key={s}
                    onClick={() => updateInterest(interest.id, { status: s, reviewDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] })}
                    className={`text-[11px] px-2 py-0.5 rounded border capitalize transition-colors hidden group-hover:inline-block ${interest.status === s ? 'bg-primary text-primary-fg border-primary' : 'border-border text-muted hover:border-primary'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-muted px-3 py-4 bg-surface rounded-[var(--radius)] text-center">No interests yet.</p>
        )}
      </div>

      {/* Suggestions panel */}
      <SlidePanel open={!!suggesting} onClose={() => { setSuggesting(null); setSuggestions([]); setSuggestError('') }} title={suggesting ? `Activity ideas for ${suggesting.title}` : 'Suggestions'}>
        {suggestError && <p className="text-sm text-urgent mb-4">{suggestError}</p>}
        {loadingSuggestions && (
          <div className="flex items-center gap-2 text-sm text-muted py-4">
            <Loader size={16} className="animate-spin" /> Generating suggestions…
          </div>
        )}
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s.title} className="p-3 bg-surface rounded-[var(--radius)] border border-border space-y-1.5">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{s.title}</p>
                  <p className="text-xs text-muted mt-0.5">{s.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 bg-accent rounded text-accent-fg capitalize">{s.category.replace('-', ' ')}</span>
                <span className="text-[11px] text-muted capitalize">{s.effort} effort</span>
                <button onClick={() => handleAddSuggestion(s)}
                  className="ml-auto text-xs px-3 py-1 bg-primary text-primary-fg rounded hover:bg-primary-hover transition-colors">
                  Add to Plan
                </button>
              </div>
            </div>
          ))}
        </div>
        {!loadingSuggestions && suggestions.length === 0 && !suggestError && suggesting && (
          <button onClick={() => handleSuggest(suggesting)}
            className="w-full py-2 border border-border rounded-[var(--radius)] text-sm text-muted hover:bg-surface-2 transition-colors flex items-center justify-center gap-2">
            <Sparkles size={14} /> Generate suggestions
          </button>
        )}
      </SlidePanel>

      <SlidePanel open={!!editing} onClose={() => setEditing(null)} title="Edit Interest">
        {editing && <InterestForm initial={editing} onDone={() => setEditing(null)} />}
      </SlidePanel>
    </div>
  )
}

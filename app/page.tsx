'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import {
  getDueTodayActivities, getOverdueActivities, getDoNowActivities,
  getNeglectedGoals, getInterestsNeedingReview, getActiveInterestsWithNoActivityThisWeek,
  getOverloadedMembers,
} from '@/lib/planning'
import { SlidePanel } from '@/components/layout/SlidePanel'
import { ActivityForm } from '@/components/forms/ActivityForm'
import type { Activity } from '@/lib/types'
import { AlertTriangle, Clock, Zap, Target, Star, ChevronRight, Heart, Users } from 'lucide-react'

const importanceDot: Record<string, string> = {
  high: 'bg-urgent', medium: 'bg-warn', low: 'bg-border',
}

const memberChipStyles = [
  'bg-status-exploring-bg text-status-exploring border-status-exploring/30',
  'bg-status-active-bg text-status-active border-status-active/30',
  'bg-status-seasonal-bg text-status-seasonal border-status-seasonal/30',
  'bg-status-paused-bg text-status-paused border-status-paused/30',
  'bg-urgent-bg text-primary border-primary/25',
]

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function Section({ icon, title, badge, children }: {
  icon: React.ReactNode; title: string; badge?: number; children: React.ReactNode
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <span className="text-muted">{icon}</span>
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {badge != null && badge > 0 && (
          <span className="ml-auto text-xs bg-urgent text-primary-fg px-2 py-0.5 rounded-full font-medium">{badge}</span>
        )}
      </div>
      {children}
    </section>
  )
}

function ActivityRow({ a, memberName, memberColor, onEdit, updateActivity }: {
  a: Activity
  memberName: (id: string) => string
  memberColor: (id: string) => string
  onEdit: (activity: Activity) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void
}) {
  const owner = memberName(a.ownerId)
  const related = a.relatedFamilyMemberId ? memberName(a.relatedFamilyMemberId) : ''

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-surface rounded-[var(--radius)] border border-border group hover:border-primary/40 hover:shadow-sm transition-all duration-150">
      <button
        onClick={() => updateActivity(a.id, { status: a.status === 'done' ? 'not-started' : 'done' })}
        aria-label={a.status === 'done' ? `Mark ${a.title} not done` : `Mark ${a.title} done`}
        className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors duration-150 ${
          a.status === 'done' ? 'bg-status-active border-status-active' : 'border-border hover:border-primary'
        }`}
      />
      <div className="flex-1 min-w-0">
        <span className={`block text-sm leading-snug ${a.status === 'done' ? 'line-through text-muted' : 'text-ink'}`}>
          {a.title}
        </span>
        {related && related !== owner && (
          <span className="text-[11px] text-muted">for {related}</span>
        )}
      </div>
      <span className={`w-2 h-2 rounded-full shrink-0 ${importanceDot[a.importance]}`} title={`${a.importance} importance`} />
      <span className={`hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border font-medium ${memberColor(a.ownerId)}`}>
        <span className="grid h-4 w-4 place-items-center rounded-full bg-bg/70 text-[9px]">{initials(owner)}</span>
        {owner}
      </span>
      <button
        onClick={() => onEdit(a)}
        aria-label={`Edit ${a.title}`}
        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted hover:text-ink transition-all duration-150"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

export default function TodayPage() {
  const { members, activities, interests, goals, updateActivity, updateInterest } = useStore()
  const [editing, setEditing] = useState<Activity | null>(null)

  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? id
  const memberColor = (id: string) => memberChipStyles[Math.max(0, members.findIndex((m) => m.id === id)) % memberChipStyles.length]

  const dueToday = getDueTodayActivities(activities)
  const overdue = getOverdueActivities(activities)
  const doNow = getDoNowActivities(activities)
  const neglectedGoals = getNeglectedGoals(goals, activities)
  const reviewNeeded = getInterestsNeedingReview(interests)
  const nudges = getActiveInterestsWithNoActivityThisWeek(interests, activities)
  const overloaded = getOverloadedMembers(activities)
  const todayCounts = members.map((member) => ({
    member,
    count: dueToday.filter((a) => a.ownerId === member.id).length,
  }))

  const rowProps = { memberName, memberColor, onEdit: setEditing, updateActivity }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Page header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Today</h1>
          <p className="text-sm text-muted mt-0.5">
            Family check-in for {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="rounded-[var(--radius)] border border-border bg-surface p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted mb-2">
            <Users size={14} />
            Household pulse
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {todayCounts.map(({ member, count }) => (
              <div key={member.id} className={`min-w-0 rounded-[var(--radius)] border px-2.5 py-2 ${memberColor(member.id)}`}>
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-bg/70 text-[10px] font-semibold">
                    {initials(member.name)}
                  </span>
                  <span className="truncate text-xs font-semibold">{member.name}</span>
                </div>
                <p className="mt-1 text-[11px] opacity-80">{count === 1 ? '1 item today' : `${count} items today`}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overload warning */}
      {Object.keys(overloaded).length > 0 && (
        <div className="bg-warn-bg border border-warn/60 text-sm px-4 py-3 rounded-[var(--radius)] flex items-center gap-2">
          <AlertTriangle size={15} className="text-warn shrink-0" />
          <span>
            <strong>{Object.keys(overloaded).map(memberName).join(', ')}</strong>{' '}
            {Object.keys(overloaded).length === 1 ? 'has' : 'have'} a full day. Consider moving one item.
          </span>
        </div>
      )}

      {/* Overdue uses a tinted background instead of a border stripe */}
      {overdue.length > 0 && (
        <Section icon={<AlertTriangle size={17} />} title="Overdue" badge={overdue.length}>
          <div className="space-y-1.5 rounded-[var(--radius)] bg-urgent-bg p-3">
            {overdue.map((a) => <ActivityRow key={a.id} a={a} {...rowProps} />)}
          </div>
        </Section>
      )}

      {/* Do Now */}
      {doNow.length > 0 && (
        <Section icon={<Zap size={17} />} title="Do Now">
          <div className="space-y-1.5">
            {doNow.map((a) => <ActivityRow key={a.id} a={a} {...rowProps} />)}
          </div>
        </Section>
      )}

      {/* Due Today */}
      <Section icon={<Clock size={17} />} title="Due Today" badge={dueToday.length}>
        {dueToday.length > 0
          ? <div className="space-y-1.5">{dueToday.map((a) => <ActivityRow key={a.id} a={a} {...rowProps} />)}</div>
          : <p className="text-sm text-muted px-3 py-3 bg-surface rounded-[var(--radius)] border border-border">Nothing scheduled for today.</p>
        }
      </Section>

      {/* Neglected goals */}
      {neglectedGoals.length > 0 && (
        <Section icon={<Target size={17} />} title="Goals needing attention">
          <div className="space-y-1.5">
            {neglectedGoals.map((g) => (
              <div key={g.id} className="px-3 py-2.5 bg-surface rounded-[var(--radius)] border border-border hover:border-primary/40 hover:shadow-sm transition-all duration-150">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink flex-1">{g.title}</span>
                  <span className="text-xs bg-warn-bg border border-warn/60 px-2 py-0.5 rounded-full text-warn">
                    {!g.nextAction?.trim() ? 'No next action' : 'No activity this month'}
                  </span>
                </div>
                {g.nextAction && <p className="text-xs text-muted mt-0.5">Next: {g.nextAction}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Interest review prompts */}
      {reviewNeeded.length > 0 && (
        <Section icon={<Heart size={17} />} title="Interests to check in on" badge={reviewNeeded.length}>
          <div className="space-y-1.5">
            {reviewNeeded.map((interest) => (
              <div key={interest.id} className="px-3 py-2.5 bg-surface rounded-[var(--radius)] border border-border flex items-center gap-3 hover:border-primary/40 transition-colors duration-150">
                <div className="flex-1">
                  <span className="text-sm font-medium text-ink">{interest.title}</span>
                  <span className="text-xs text-muted ml-2">{memberName(interest.familyMemberId)}</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {(['active', 'paused', 'dropped'] as const).map((s) => (
                    <button key={s}
                      onClick={() => updateInterest(interest.id, {
                        status: s,
                        reviewDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                      })}
                      className={`text-xs px-2 py-1 rounded capitalize border transition-all duration-150 ${
                        interest.status === s
                          ? 'bg-primary text-primary-fg border-primary'
                          : 'border-border text-muted hover:border-primary hover:text-ink'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Interest nudges */}
      {nudges.length > 0 && (
        <Section icon={<Star size={17} />} title="Interests that could use a small moment">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {nudges.map((i) => (
              <div key={i.id} className="px-3 py-2.5 bg-surface rounded-[var(--radius)] border border-border hover:border-primary/40 transition-colors duration-150">
                <span className="text-sm font-medium text-ink">{i.title}</span>
                <span className="text-muted ml-1.5 text-xs">{memberName(i.familyMemberId)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <SlidePanel open={!!editing} onClose={() => setEditing(null)} title="Edit Activity">
        {editing && <ActivityForm initial={editing} onDone={() => setEditing(null)} />}
      </SlidePanel>
    </div>
  )
}

import type { Activity, Interest, Goal } from './types'

export type EisenhowerQuadrant = 'do-now' | 'schedule' | 'delegate' | 'drop'

export function getQuadrant(a: Pick<Activity, 'importance' | 'urgency'>): EisenhowerQuadrant {
  const hi = a.importance === 'high'
  const hu = a.urgency === 'high'
  if (hi && hu) return 'do-now'
  if (hi && !hu) return 'schedule'
  if (!hi && hu) return 'delegate'
  return 'drop'
}

export function isToday(dateStr: string | undefined): boolean {
  if (!dateStr) return false
  return dateStr === todayStr()
}

export function isOverdue(a: Activity): boolean {
  if (a.status === 'done' || a.status === 'skipped') return false
  const target = a.dueDate || a.date
  if (!target) return false
  return target < todayStr()
}

export function localDateStr(d = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayStr(): string {
  return localDateStr()
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isThisWeek(dateStr: string | undefined): boolean {
  if (!dateStr) return false
  const today = new Date()
  const monday = new Date(today)
  const dayOfWeek = today.getDay()
  monday.setDate(today.getDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  const d = parseLocalDate(dateStr)
  return d >= monday && d <= sunday
}

export function isThisMonth(dateStr: string | undefined): boolean {
  if (!dateStr) return false
  const today = new Date()
  const d = parseLocalDate(dateStr)
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
}

export function isPastReviewDate(interest: Interest): boolean {
  return interest.reviewDate < todayStr()
}

export function getActiveInterestsWithNoActivityThisWeek(
  interests: Interest[],
  activities: Activity[]
): Interest[] {
  return interests.filter((interest) => {
    if (interest.status !== 'active') return false
    return !activities.some(
      (a) => a.linkedInterestId === interest.id && isThisWeek(a.date) && a.status !== 'done' && a.status !== 'skipped'
    )
  })
}

export function getNeglectedGoals(goals: Goal[], activities: Activity[]): Goal[] {
  return goals.filter((goal) => {
    if (goal.status !== 'active') return false
    const noNextAction = !goal.nextAction?.trim()
    const noActivityThisMonth = !activities.some(
      (a) => a.linkedGoalId === goal.id && isThisMonth(a.date) && a.status !== 'done'
    )
    return noNextAction || noActivityThisMonth
  })
}

export function getOverloadedMembers(
  activities: Activity[],
  threshold = 4
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const a of activities) {
    if (isToday(a.date) && a.status !== 'done' && a.status !== 'skipped') {
      counts[a.ownerId] = (counts[a.ownerId] ?? 0) + 1
    }
  }
  return Object.fromEntries(Object.entries(counts).filter(([, n]) => n > threshold))
}

export function getInterestsNeedingReview(interests: Interest[]): Interest[] {
  return interests.filter(
    (i) => i.status !== 'dropped' && isPastReviewDate(i)
  )
}

export function getDueTodayActivities(activities: Activity[]): Activity[] {
  return activities.filter(
    (a) => isToday(a.date) && a.status !== 'done' && a.status !== 'skipped'
  )
}

export function getOverdueActivities(activities: Activity[]): Activity[] {
  return activities.filter(isOverdue)
}

export function getDoNowActivities(activities: Activity[]): Activity[] {
  return activities.filter(
    (a) => a.importance === 'high' && a.urgency === 'high' && a.status !== 'done' && a.status !== 'skipped'
  )
}

export function getWeekActivities(activities: Activity[]): Activity[] {
  return activities.filter((a) => isThisWeek(a.date))
}

import type { Interest, FamilyMember, Activity, Suggestion, AppSettings } from './types'

export async function fetchSuggestions(
  interest: Interest,
  member: FamilyMember,
  activities: Activity[],
  settings: AppSettings,
  coords?: { lat: number; lng: number }
): Promise<Suggestion[]> {
  const res = await fetch('/api/suggestions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ interest, member, activities, settings, coords }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Suggestion API error ${res.status}`)
  return data.suggestions as Suggestion[]
}

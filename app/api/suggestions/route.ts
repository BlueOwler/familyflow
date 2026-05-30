import { NextResponse } from 'next/server'
import type { Activity, FamilyMember, Interest, Suggestion, AppSettings } from '@/lib/types'

const validCategories = new Set([
  'school', 'health', 'household', 'finance', 'errands',
  'family-time', 'work', 'personal', 'enrichment', 'admin',
])
const validEfforts = new Set(['small', 'medium', 'large'])

function isSuggestion(v: unknown): v is Suggestion {
  if (!v || typeof v !== 'object') return false
  const s = v as Partial<Suggestion>
  return (
    typeof s.title === 'string' &&
    typeof s.description === 'string' &&
    typeof s.category === 'string' && validCategories.has(s.category) &&
    typeof s.effort === 'string' && validEfforts.has(s.effort)
  )
}

function parseSuggestions(text: string): Suggestion[] {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
  const parsed = JSON.parse(cleaned) as unknown
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isSuggestion).slice(0, 4)
}

export async function POST(request: Request) {
  const body = await request.json() as {
    interest?: Interest
    member?: FamilyMember
    activities?: Activity[]
    settings?: AppSettings
    coords?: { lat: number; lng: number }
  }

  const { interest, member, activities, settings, coords } = body

  if (!interest || !member || !Array.isArray(activities)) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const baseUrl = settings?.apiBaseUrl?.replace(/\/$/, '') || ''
  const apiKey = settings?.apiKey || ''
  const model = settings?.model || ''

  if (!baseUrl || !model) {
    return NextResponse.json(
      { error: 'Configure API base URL and model in Settings to enable suggestions.' },
      { status: 503 }
    )
  }

  const month = new Date().toLocaleString('default', { month: 'long' })
  const recent = activities
    .filter((a) => a.linkedInterestId === interest.id)
    .slice(0, 5)
    .map((a) => a.title)

  const locationNote = coords
    ? `The family is near coordinates ${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}.`
    : ''

  const prompt = `You are helping a family plan enriching activities for ${member.name} (${member.ageOrStage}).

Interest: "${interest.title}" (category: ${interest.category}, status: ${interest.status}, intensity: ${interest.intensity})
Current month: ${month}
${locationNote}
Recent activities for this interest: ${recent.length ? recent.join(', ') : 'none yet'}

Suggest 4 concrete, actionable activities or plans that fit this interest, age, and time of year.
${coords ? 'Include local options where relevant (e.g. nearby camps, classes, or venues).' : ''}

Reply ONLY with a JSON array, no markdown, no explanation:
[{"title":"...","description":"...","category":"enrichment","effort":"small|medium|large"},...]

Valid category values: school, health, household, finance, errands, family-time, work, personal, enrichment, admin`

  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    return NextResponse.json(
      { error: `Provider error ${res.status}${errText ? `: ${errText.slice(0, 200)}` : ''}` },
      { status: res.status }
    )
  }

  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const text = data.choices?.[0]?.message?.content ?? '[]'

  try {
    return NextResponse.json({ suggestions: parseSuggestions(text) })
  } catch {
    return NextResponse.json({ error: 'Provider returned invalid JSON.' }, { status: 502 })
  }
}

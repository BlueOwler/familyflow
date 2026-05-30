import { NextResponse } from 'next/server'
import type { Activity, FamilyMember, Interest, Suggestion } from '@/lib/types'

const validCategories = new Set([
  'school', 'health', 'household', 'finance', 'errands',
  'family-time', 'work', 'personal', 'enrichment', 'admin',
])

const validEfforts = new Set(['small', 'medium', 'large'])

function isSuggestion(value: unknown): value is Suggestion {
  if (!value || typeof value !== 'object') return false
  const suggestion = value as Partial<Suggestion>
  return (
    typeof suggestion.title === 'string' &&
    typeof suggestion.description === 'string' &&
    typeof suggestion.category === 'string' &&
    validCategories.has(suggestion.category) &&
    typeof suggestion.effort === 'string' &&
    validEfforts.has(suggestion.effort)
  )
}

function parseSuggestions(text: string): Suggestion[] {
  const parsed = JSON.parse(text) as unknown
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isSuggestion).slice(0, 4)
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' }, { status: 503 })
  }

  const body = await request.json() as {
    interest?: Interest
    member?: FamilyMember
    activities?: Activity[]
    coords?: { lat: number; lng: number }
  }

  if (!body.interest || !body.member || !Array.isArray(body.activities)) {
    return NextResponse.json({ error: 'Missing suggestion inputs.' }, { status: 400 })
  }

  const { interest, member, activities, coords } = body
  const month = new Date().toLocaleString('default', { month: 'long' })
  const recent = activities
    .filter((a) => a.linkedInterestId === interest.id)
    .slice(0, 5)
    .map((a) => a.title)

  const locationNote = coords
    ? `The family is located near coordinates ${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}.`
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

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: `Anthropic API error ${res.status}` }, { status: res.status })
  }

  const data = await res.json() as { content?: Array<{ text?: string }> }
  const text = data.content?.[0]?.text ?? '[]'

  try {
    return NextResponse.json({ suggestions: parseSuggestions(text) })
  } catch {
    return NextResponse.json({ error: 'Anthropic returned invalid suggestion JSON.' }, { status: 502 })
  }
}

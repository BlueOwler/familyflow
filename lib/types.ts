export type MemberRole = 'parent' | 'child' | 'family'

export interface FamilyMember {
  id: string
  name: string
  role: MemberRole
  ageOrStage: string
  notes?: string
}

export type InterestStatus = 'exploring' | 'active' | 'paused' | 'seasonal' | 'dropped'
export type Intensity = 'low' | 'medium' | 'high'

export interface Interest {
  id: string
  title: string
  familyMemberId: string
  category: string
  status: InterestStatus
  intensity: Intensity
  startDate: string
  reviewDate: string
  notes?: string
}

export type ActivityCategory =
  | 'school' | 'health' | 'household' | 'finance' | 'errands'
  | 'family-time' | 'work' | 'personal' | 'enrichment' | 'admin'

export type ImportanceLevel = 'low' | 'medium' | 'high'
export type UrgencyLevel = 'low' | 'medium' | 'high'
export type EffortLevel = 'small' | 'medium' | 'large'
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly'
export type ActivityStatus = 'not-started' | 'in-progress' | 'done' | 'skipped'

export interface Activity {
  id: string
  title: string
  description?: string
  ownerId: string
  relatedFamilyMemberId?: string
  linkedInterestId?: string
  linkedGoalId?: string
  category: ActivityCategory
  date?: string
  dueDate?: string
  importance: ImportanceLevel
  urgency: UrgencyLevel
  effort: EffortLevel
  recurrence: Recurrence
  status: ActivityStatus
}

export type GoalHorizon = 'this-month' | 'quarter' | 'year' | 'long-term'
export type GoalStatus = 'active' | 'paused' | 'complete'

export interface Goal {
  id: string
  title: string
  description?: string
  relatedFamilyMemberId?: string
  linkedInterestIds: string[]
  horizon: GoalHorizon
  nextAction?: string
  status: GoalStatus
}

export interface Suggestion {
  title: string
  description: string
  category: ActivityCategory
  effort: EffortLevel
}

export interface AppSettings {
  apiBaseUrl?: string  // OpenAI-compatible base URL, e.g. https://openrouter.ai/api/v1
  apiKey?: string
  model?: string
}

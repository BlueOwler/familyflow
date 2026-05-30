import type { FamilyMember, Interest, Activity, Goal } from './types'

function localDateStr(d = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function daysFromToday(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return localDateStr(d)
}

export const seedMembers: FamilyMember[] = [
  { id: 'm-sarath', name: 'Sarath', role: 'parent', ageOrStage: 'Adult' },
  { id: 'm-remya', name: 'Remya', role: 'parent', ageOrStage: 'Adult' },
  { id: 'm-noah', name: 'Noah', role: 'child', ageOrStage: 'Age 7' },
  { id: 'm-jonah', name: 'Jonah', role: 'child', ageOrStage: 'Age 4' },
  { id: 'm-family', name: 'Family', role: 'family', ageOrStage: 'Shared' },
]

export const seedInterests: Interest[] = [
  { id: 'i-1', title: 'Dinosaurs', familyMemberId: 'm-noah', category: 'Learning', status: 'active', intensity: 'high', startDate: daysFromToday(-90), reviewDate: daysFromToday(-5) },
  { id: 'i-2', title: 'Swimming', familyMemberId: 'm-noah', category: 'Sports', status: 'active', intensity: 'high', startDate: daysFromToday(-60), reviewDate: daysFromToday(14) },
  { id: 'i-3', title: 'Drawing', familyMemberId: 'm-noah', category: 'Arts', status: 'exploring', intensity: 'medium', startDate: daysFromToday(-30), reviewDate: daysFromToday(7) },
  { id: 'i-4', title: 'Soccer', familyMemberId: 'm-noah', category: 'Sports', status: 'paused', intensity: 'low', startDate: daysFromToday(-120), reviewDate: daysFromToday(-10) },
  { id: 'i-5', title: 'Fitness', familyMemberId: 'm-sarath', category: 'Health', status: 'active', intensity: 'medium', startDate: daysFromToday(-180), reviewDate: daysFromToday(21) },
  { id: 'i-6', title: 'Career Planning', familyMemberId: 'm-sarath', category: 'Work', status: 'active', intensity: 'high', startDate: daysFromToday(-365), reviewDate: daysFromToday(30) },
  { id: 'i-7', title: 'AI Tools', familyMemberId: 'm-sarath', category: 'Technology', status: 'exploring', intensity: 'high', startDate: daysFromToday(-14), reviewDate: daysFromToday(14) },
  { id: 'i-8', title: 'Family Finance', familyMemberId: 'm-sarath', category: 'Finance', status: 'active', intensity: 'medium', startDate: daysFromToday(-200), reviewDate: daysFromToday(-3) },
  { id: 'i-9', title: 'Weekend Outings', familyMemberId: 'm-family', category: 'Family Time', status: 'active', intensity: 'high', startDate: daysFromToday(-90), reviewDate: daysFromToday(7) },
  { id: 'i-10', title: 'Vacation Planning', familyMemberId: 'm-family', category: 'Travel', status: 'exploring', intensity: 'medium', startDate: daysFromToday(-30), reviewDate: daysFromToday(30) },
  { id: 'i-11', title: 'Home Routines', familyMemberId: 'm-family', category: 'Household', status: 'paused', intensity: 'low', startDate: daysFromToday(-60), reviewDate: daysFromToday(-7) },
]

export const seedActivities: Activity[] = [
  { id: 'a-1', title: 'Pack school bag for Noah', ownerId: 'm-remya', relatedFamilyMemberId: 'm-noah', category: 'school', date: daysFromToday(0), importance: 'high', urgency: 'high', effort: 'small', recurrence: 'daily', status: 'not-started' },
  { id: 'a-2', title: 'Swimming class', ownerId: 'm-remya', relatedFamilyMemberId: 'm-noah', linkedInterestId: 'i-2', category: 'enrichment', date: daysFromToday(0), importance: 'high', urgency: 'high', effort: 'small', recurrence: 'weekly', status: 'not-started' },
  { id: 'a-3', title: 'Pay utility bill', ownerId: 'm-sarath', category: 'finance', date: daysFromToday(-2), dueDate: daysFromToday(-1), importance: 'high', urgency: 'high', effort: 'small', recurrence: 'none', status: 'not-started' },
  { id: 'a-4', title: 'Grocery pickup', ownerId: 'm-remya', category: 'errands', date: daysFromToday(0), importance: 'medium', urgency: 'medium', effort: 'medium', recurrence: 'weekly', status: 'not-started' },
  { id: 'a-5', title: 'Read dinosaur book with Noah', ownerId: 'm-sarath', relatedFamilyMemberId: 'm-noah', linkedInterestId: 'i-1', category: 'enrichment', date: daysFromToday(1), importance: 'high', urgency: 'low', effort: 'small', recurrence: 'none', status: 'not-started' },
  { id: 'a-6', title: 'Book pediatric appointment', ownerId: 'm-remya', relatedFamilyMemberId: 'm-noah', category: 'health', date: daysFromToday(2), dueDate: daysFromToday(7), importance: 'high', urgency: 'medium', effort: 'small', recurrence: 'none', status: 'not-started' },
  { id: 'a-7', title: 'Review RESP contribution', ownerId: 'm-sarath', linkedInterestId: 'i-8', category: 'finance', date: daysFromToday(3), importance: 'high', urgency: 'low', effort: 'medium', recurrence: 'monthly', status: 'not-started' },
  { id: 'a-8', title: 'Plan Saturday outing', ownerId: 'm-family', linkedInterestId: 'i-9', category: 'family-time', date: daysFromToday(2), importance: 'medium', urgency: 'medium', effort: 'small', recurrence: 'none', status: 'not-started' },
  { id: 'a-9', title: 'Laundry', ownerId: 'm-remya', category: 'household', date: daysFromToday(0), importance: 'medium', urgency: 'medium', effort: 'medium', recurrence: 'weekly', status: 'not-started' },
  { id: 'a-10', title: 'Parent workout', ownerId: 'm-sarath', linkedInterestId: 'i-5', category: 'health', date: daysFromToday(1), importance: 'medium', urgency: 'low', effort: 'medium', recurrence: 'weekly', status: 'not-started' },
  { id: 'a-11', title: 'Jonah storytime', ownerId: 'm-remya', relatedFamilyMemberId: 'm-jonah', category: 'enrichment', date: daysFromToday(0), importance: 'medium', urgency: 'low', effort: 'small', recurrence: 'daily', status: 'not-started' },
  { id: 'a-12', title: 'Call insurance provider', ownerId: 'm-sarath', category: 'admin', date: daysFromToday(-3), importance: 'medium', urgency: 'high', effort: 'small', recurrence: 'none', status: 'not-started' },
]

export const seedGoals: Goal[] = [
  { id: 'g-1', title: 'Plan summer family activities', relatedFamilyMemberId: 'm-family', linkedInterestIds: ['i-9', 'i-10'], horizon: 'quarter', nextAction: 'Research camps near Ottawa', status: 'active' },
  { id: 'g-2', title: 'Improve family fitness routine', relatedFamilyMemberId: 'm-family', linkedInterestIds: ['i-5'], horizon: 'this-month', nextAction: '', status: 'active' },
  { id: 'g-3', title: 'Organize household documents', relatedFamilyMemberId: 'm-sarath', linkedInterestIds: [], horizon: 'quarter', nextAction: 'Buy filing folders', status: 'active' },
  { id: 'g-4', title: 'Build better bedtime routine', relatedFamilyMemberId: 'm-family', linkedInterestIds: ['i-11'], horizon: 'this-month', nextAction: '', status: 'active' },
  { id: 'g-5', title: 'Plan family vacation', relatedFamilyMemberId: 'm-family', linkedInterestIds: ['i-10'], horizon: 'year', nextAction: 'Decide destination by July', status: 'active' },
]

export const seedData = {
  members: seedMembers,
  interests: seedInterests,
  activities: seedActivities,
  goals: seedGoals,
}

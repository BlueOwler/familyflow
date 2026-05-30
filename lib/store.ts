'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FamilyMember, Interest, Activity, Goal, AppSettings } from './types'
import { seedData } from './seed'

interface AppStore {
  members: FamilyMember[]
  interests: Interest[]
  activities: Activity[]
  goals: Goal[]
  settings: AppSettings

  updateSettings: (s: Partial<AppSettings>) => void
  addActivity: (a: Omit<Activity, 'id'>) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void
  deleteActivity: (id: string) => void

  addInterest: (i: Omit<Interest, 'id'>) => void
  updateInterest: (id: string, updates: Partial<Interest>) => void
  deleteInterest: (id: string) => void

  addGoal: (g: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
}

type PersistedStore = Pick<AppStore, 'members' | 'interests' | 'activities' | 'goals' | 'settings'>

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      ...seedData,
      settings: {},

      updateSettings: (s) => set((prev) => ({ settings: { ...prev.settings, ...s } })),
      addActivity: (a) =>
        set((s) => ({ activities: [...s.activities, { ...a, id: crypto.randomUUID() }] })),
      updateActivity: (id, updates) =>
        set((s) => ({ activities: s.activities.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),
      deleteActivity: (id) =>
        set((s) => ({ activities: s.activities.filter((a) => a.id !== id) })),

      addInterest: (i) =>
        set((s) => ({ interests: [...s.interests, { ...i, id: crypto.randomUUID() }] })),
      updateInterest: (id, updates) =>
        set((s) => ({ interests: s.interests.map((i) => (i.id === id ? { ...i, ...updates } : i)) })),
      deleteInterest: (id) =>
        set((s) => ({ interests: s.interests.filter((i) => i.id !== id) })),

      addGoal: (g) =>
        set((s) => ({ goals: [...s.goals, { ...g, id: crypto.randomUUID() }] })),
      updateGoal: (id, updates) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
    }),
    {
      name: 'familyflow-store',
      partialize: ({ members, interests, activities, goals, settings }) => ({ members, interests, activities, goals, settings }),
      merge: (persisted, current) => {
        const data = persisted as Partial<PersistedStore>
        return {
          ...current,
          members: data.members ?? current.members,
          interests: data.interests ?? current.interests,
          activities: data.activities ?? current.activities,
          goals: data.goals ?? current.goals,
          settings: data.settings ?? current.settings,
        }
      },
    }
  )
)

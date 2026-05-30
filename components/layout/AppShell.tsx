'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { SlidePanel } from './SlidePanel'
import { ActivityForm } from '../forms/ActivityForm'
import { InterestForm } from '../forms/InterestForm'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [activityOpen, setActivityOpen] = useState(false)
  const [interestOpen, setInterestOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        onAddActivity={() => setActivityOpen(true)}
        onAddInterest={() => setInterestOpen(true)}
      />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />

      <SlidePanel open={activityOpen} onClose={() => setActivityOpen(false)} title="Add Activity">
        <ActivityForm onDone={() => setActivityOpen(false)} />
      </SlidePanel>

      <SlidePanel open={interestOpen} onClose={() => setInterestOpen(false)} title="Add Interest">
        <InterestForm onDone={() => setInterestOpen(false)} />
      </SlidePanel>
    </div>
  )
}

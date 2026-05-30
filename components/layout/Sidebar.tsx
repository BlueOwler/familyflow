'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, CalendarDays, LayoutGrid, Star, Target, Plus, Settings,
} from 'lucide-react'

const nav = [
  { href: '/', label: 'Today', icon: Home },
  { href: '/week', label: 'Week', icon: CalendarDays },
  { href: '/priorities', label: 'Priorities', icon: LayoutGrid },
  { href: '/interests', label: 'Interests', icon: Star },
  { href: '/goals', label: 'Goals', icon: Target },
]

interface Props {
  onAddActivity: () => void
  onAddInterest: () => void
}

export function Sidebar({ onAddActivity, onAddInterest }: Props) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-surface border-r border-border h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-border">
        <span className="text-[17px] font-semibold text-ink tracking-tight">FamilyFlow</span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm transition-colors ${
                active
                  ? 'bg-primary text-primary-fg font-medium'
                  : 'text-ink hover:bg-surface-2'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-border space-y-0.5">
        <button
          onClick={onAddActivity}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[var(--radius)] text-sm text-ink hover:bg-surface-2 transition-colors"
        >
          <Plus size={16} />
          Add Activity
        </button>
        <button
          onClick={onAddInterest}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[var(--radius)] text-sm text-ink hover:bg-surface-2 transition-colors"
        >
          <Plus size={16} />
          Add Interest
        </button>
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm transition-colors ${
            pathname === '/settings' ? 'bg-primary text-primary-fg font-medium' : 'text-muted hover:bg-surface-2'
          }`}
        >
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  )
}

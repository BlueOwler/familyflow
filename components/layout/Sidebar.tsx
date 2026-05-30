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
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-bg border-r border-border h-screen sticky top-0">
      {/* Wordmark */}
      <div className="px-5 py-5 border-b border-border">
        <span
          className="text-[22px] font-semibold text-ink leading-none tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Family<span className="text-primary">Flow</span>
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius)] text-sm transition-all duration-150 ${
                active
                  ? 'bg-primary text-primary-fg font-medium shadow-sm'
                  : 'text-ink hover:bg-surface-2 hover:translate-x-0.5'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-border space-y-0.5">
        <button
          onClick={onAddActivity}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[var(--radius)] text-sm text-muted hover:text-ink hover:bg-surface-2 transition-all duration-150"
        >
          <Plus size={15} strokeWidth={1.8} />
          Add Activity
        </button>
        <button
          onClick={onAddInterest}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[var(--radius)] text-sm text-muted hover:text-ink hover:bg-surface-2 transition-all duration-150"
        >
          <Plus size={15} strokeWidth={1.8} />
          Add Interest
        </button>
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm transition-all duration-150 ${
            pathname === '/settings'
              ? 'bg-primary text-primary-fg font-medium shadow-sm'
              : 'text-muted hover:text-ink hover:bg-surface-2'
          }`}
        >
          <Settings size={15} strokeWidth={1.8} />
          Settings
        </Link>
      </div>
    </aside>
  )
}

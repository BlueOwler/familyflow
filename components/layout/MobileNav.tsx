'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, LayoutGrid, Star, Target } from 'lucide-react'

const nav = [
  { href: '/', label: 'Today', icon: Home },
  { href: '/week', label: 'Week', icon: CalendarDays },
  { href: '/priorities', label: 'Priorities', icon: LayoutGrid },
  { href: '/interests', label: 'Interests', icon: Star },
  { href: '/goals', label: 'Goals', icon: Target },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg/95 border-t border-border z-50 flex shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`relative min-w-0 flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
              active ? 'text-primary font-medium' : 'text-muted'
            }`}
          >
            {active && <span className="absolute top-1 h-1 w-6 rounded-full bg-primary" />}
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="max-w-full truncate px-0.5">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

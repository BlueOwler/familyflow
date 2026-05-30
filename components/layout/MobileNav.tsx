'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, LayoutGrid, Star, Target } from 'lucide-react'

const nav = [
  { href: '/', label: 'Today', icon: Home },
  { href: '/week', label: 'Week', icon: CalendarDays },
  { href: '/priorities', label: 'Matrix', icon: LayoutGrid },
  { href: '/interests', label: 'Interests', icon: Star },
  { href: '/goals', label: 'Goals', icon: Target },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg border-t border-border z-50 flex">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${
              active ? 'text-primary' : 'text-muted'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

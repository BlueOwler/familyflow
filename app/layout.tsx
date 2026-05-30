import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FamilyFlow',
  description: 'Adaptive family activity planner',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${fraunces.variable} ${dmSans.variable}`}>
      <body className="h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

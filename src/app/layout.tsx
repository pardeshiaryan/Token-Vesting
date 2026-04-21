import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import React from 'react'

export const metadata: Metadata = {
  title: 'Automated Vesting System using Solana',
  description: 'Solana token vesting platform for teams, startups and DAOs',
}

const links = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/vesting' },
  { label: 'Claims', path: '/vesting-claim' },
  { label: 'Account', path: '/account' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-black text-white antialiased">
        <AppProviders>
          <AppLayout links={links}>
            {children}
          </AppLayout>
        </AppProviders>
      </body>
    </html>
  )
}

declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { ThemeSelect } from '@/components/theme-select'
import { ClusterUiSelect } from './cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'

export function AppHeader({
  links = [],
}: {
  links: { label: string; path: string }[]
}) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 font-black text-black shadow-lg shadow-emerald-500/20">
            A
          </div>

          <div className="hidden sm:block min-w-0">
            <h1 className="truncate text-lg font-bold leading-none text-white">
              Automated Vesting System using Solana
            </h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.38em] text-white/35">
              Smart Contract Payroll
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2">
          {links.map(({ label, path }) => (
            <Link
              key={path}
              href={path}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                isActive(path)
                  ? 'bg-white/10 text-white'
                  : 'text-white/55 hover:bg-white/5 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <WalletButton />
          <ClusterUiSelect />
          <ThemeSelect />
        </div>

        {/* Mobile Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/5"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="border-t border-white/5 bg-black/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-5 space-y-5">
            <nav className="flex flex-col gap-2">
              {links.map(({ label, path }) => (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setShowMenu(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive(path)
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="space-y-3 border-t border-white/5 pt-4">
              <WalletButton />
              <ClusterUiSelect />
              <ThemeSelect />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
import React from 'react'

export function AppFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-black">
      {/* background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-3">
          {/* brand */}
          <div>
            <h3 className="text-xl font-semibold text-white">
              Automated Vesting System using Solana
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/40 max-w-xs">
              Secure and transparent token vesting infrastructure built on
              Solana for teams, startups, and DAOs.
            </p>
          </div>

          {/* links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Navigation
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <a
                href="/"
                className="block text-white/50 hover:text-white transition-colors"
              >
                Home
              </a>

              <a
                href="/vestingProgram"
                className="block text-white/50 hover:text-white transition-colors"
              >
                Vesting Dashboard
              </a>

              <a
                href="/vestingClaim"
                className="block text-white/50 hover:text-white transition-colors"
              >
                Claim Tokens
              </a>

              <a
                href="/account"
                className="block text-white/50 hover:text-white transition-colors"
              >
                Wallet Account
              </a>
            </div>
          </div>

          {/* ecosystem */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Ecosystem
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <a
                href="https://solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/50 hover:text-white transition-colors"
              >
                Solana
              </a>

              <a
                href="https://docs.solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/50 hover:text-white transition-colors"
              >
                Docs
              </a>

           
            </div>
          </div>
        </div>

        {/* bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-6 text-xs text-white/30 md:flex-row md:items-center md:justify-between">
          <p>© 2026 AAP. All rights reserved.</p>

          <p>
            Built with Solana • Powered by smart contracts
          </p>
        </div>
      </div>
    </footer>
  )
}
import { AppHero } from '@/components/app-hero'

const stats = [
  { label: 'On-chain', value: '100%' },
  { label: 'Trustless', value: '24/7' },
  { label: 'Claims', value: 'Instant' },
]

const features = [
  {
    title: 'Treasury Vault',
    desc: 'Create PDA-controlled treasury accounts that hold tokens securely for future distribution.',
  },
  {
    title: 'Employee Vesting',
    desc: 'Assign beneficiaries, start dates, cliff periods, and linear unlock schedules.',
  },
  {
    title: 'Self Claims',
    desc: 'Employees connect wallet and claim vested tokens directly without middlemen.',
  },
  {
    title: 'Transparent',
    desc: 'Every vesting rule and transfer lives on Solana for public verification.',
  },
]

const steps = [
  'Create company vesting account',
  'Fund treasury token vault',
  'Add employee schedules',
  'Employees claim unlocked tokens',
]

export function DashboardFeature() {
  return (
    <div className="relative overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* hero */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        <AppHero
          title="Token Vesting Infrastructure"
          subtitle="Automate employee, advisor, and team token unlocks on Solana with transparent smart contracts."
        />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/vestingProgram"
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition-all"
          >
            Launch Dashboard
          </a>

          <a
            href="/vestingClaim"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white hover:bg-white/[0.07] transition-all"
          >
            Claim Tokens
          </a>
        </div>

        {/* stats */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {stats.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-6 py-6 text-center"
            >
              <p className="text-3xl font-bold text-white">{item.value}</p>
              <p className="mt-1 text-sm text-white/40">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* feature grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">
            Core Features
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white">
            Built for serious token teams
          </h2>
          <p className="mt-3 text-sm text-white/40 max-w-2xl mx-auto">
            Replace spreadsheets, manual transfers, and trust issues with a clean
            programmable vesting system.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 hover:bg-white/[0.05] transition-all"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold">
                0{i + 1}
              </div>

              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/45">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* process section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
              Workflow
            </p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              From treasury to payout
            </h2>

            <div className="mt-8 space-y-5">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-sm font-semibold text-white">
                    {i + 1}
                  </div>

                  <p className="pt-2 text-sm text-white/60">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* pseudo dashboard preview */}
          <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8">
            <div className="rounded-2xl border border-white/[0.07] bg-black/40 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/40">Company</p>
                  <h3 className="text-xl font-semibold text-white">
                    Placeholder Labs
                  </h3>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                  Active
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {['12 Employees', '250K Tokens', '73% Claimed'].map(
                  (x, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-4 text-center text-sm text-white/70"
                    >
                      {x}
                    </div>
                  )
                )}
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs text-white/35">
                  <span>Unlock Progress</span>
                  <span>73%</span>
                </div>

                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full w-[73%] rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* final CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] px-8 py-12 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">
            Ready
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            Launch your token vesting system
          </h2>

          <p className="mt-3 text-sm text-white/45 max-w-xl mx-auto">
            Clean UI. Real on-chain logic. Smooth employee claims.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/vestingProgram"
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition-all"
            >
              Start Now
            </a>

            <a
              href="/account"
              className="rounded-xl border border-white/10 px-6 py-3 text-sm text-white hover:bg-white/[0.05] transition-all"
            >
              Connect Wallet
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
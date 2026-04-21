
import { PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";
import {
  useVestingProgram,
  useVestingProgramAccount,
} from "./vesting-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useCluster } from "../cluster/cluster-data-access";
import { useTransactionToast } from "../use-transaction-toast";
import { toast } from "sonner";
// ─── ClaimCard ────────────────────────────────────────────────────────────────
export async function ClaimCard({ employeeAccount }: { employeeAccount: any }) {
  const { program } = useVestingProgram()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { publicKey } = useWallet()

  const claimTokens = useMutation({


    mutationKey: [
      'claim-tokens',
      { cluster, pk: employeeAccount.publicKey.toString() },
    ],
    mutationFn: async () => {
      const vestingAccount = await program.account.vestingAccount.fetch(
        employeeAccount.account.vestingAccount
      )

      return program.methods
        .claimTokens(vestingAccount.companyName)
        .accounts({
          beneficiary: publicKey,
          employeeAccount: employeeAccount.publicKey,
          vestingAccount: employeeAccount.account.vestingAccount,
          mint: vestingAccount.mint,
          treasuryTokenAccount: vestingAccount.treasuryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc()
    },
    onSuccess: (tx) => {
      transactionToast(tx)
      window.location.reload()
    },
    onError: (e: any) => toast.error(`Claim failed: ${e.message}`),
  })

  const acc = employeeAccount.account

const vesting = await program.account.vestingAccount.fetch(
  acc.vestingAccount
);

console.log(vesting.treasuryTokenAccount.toString());
 console.log({
  beneficiary: acc.beneficiary.toString(),
  vestingAccount: acc.vestingAccount.toString(),
  bump: acc.bump,

  totalAmount: acc.totalAmount.toString(),
  totalWithdrawn: acc.totalWithdrawn.toString(),

  startTime: acc.startTime.toNumber(),
  cliffTime: acc.cliffTime.toNumber(),
  endTime: acc.endTime.toNumber(),
})
  const total = acc.totalAmount.toNumber()
  const withdrawn = acc.totalWithdrawn.toNumber()

  const now = Math.floor(Date.now() / 1000)

  const start = acc.startTime.toNumber()
  const cliff = acc.cliffTime.toNumber()
  const end = acc.endTime.toNumber()

  const beforeCliff = now < cliff
  const fullyVested = now >= end

  let vested = 0

  if (beforeCliff) {
    vested = 0
  } else if (fullyVested) {
    vested = total
  } else {
    vested = Math.floor((total * (now - start)) / (end - start))
  }

  const claimable = Math.max(0, vested - withdrawn)
  const remaining = Math.max(0, total - withdrawn)

  const vestedPct =
    total === 0 ? 0 : Math.min(100, Math.round((vested / total) * 100))

  const claimedPct =
    total === 0 ? 0 : Math.min(100, Math.round((withdrawn / total) * 100))

  const secondsLeft = Math.max(0, end - now)

  const hours = Math.floor(secondsLeft / 3600)
  const mins = Math.floor((secondsLeft % 3600) / 60)

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
      {/* top */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs text-white/30 font-mono">
              Vesting account: {acc.vestingAccount.toString()}
             

            </p>
          </div>

          <Pill
            label={
              beforeCliff
                ? 'Before cliff'
                : claimable > 0
                ? 'Claimable'
                : remaining === 0
                ? 'Fully claimed'
                : 'Streaming'
            }
            color={
              beforeCliff
                ? 'gray'
                : claimable > 0
                ? 'amber'
                : remaining === 0
                ? 'green'
                : 'teal'
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatCard label="Total" value={total.toLocaleString()} />
          <StatCard label="Claimed" value={withdrawn.toLocaleString()} />
          <StatCard
            label="Available"
            value={claimable.toLocaleString()}
            accent={claimable > 0}
          />
        </div>

        {/* vested progress */}
        <ProgressBar value={vestedPct} />

        <div className="flex justify-between mt-2 text-[11px] text-white/30">
          <span>{vestedPct}% vested</span>
          <span>{claimedPct}% claimed</span>
        </div>
      </div>

      {/* dates */}
      <div className="px-6 py-4 grid sm:grid-cols-3 gap-3 border-b border-white/[0.06]">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-widest text-white/25 mb-0.5">
            Start
          </p>
          <p className="text-xs text-white/60">
            {fmtDate(start)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[11px] uppercase tracking-widest text-white/25 mb-0.5">
            Cliff
          </p>
          <p className="text-xs text-white/60">
            {fmtDate(cliff)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[11px] uppercase tracking-widest text-white/25 mb-0.5">
            End
          </p>
          <p className="text-xs text-white/60">
            {fmtDate(end)}
          </p>
        </div>
      </div>

      {/* bottom */}
      <div className="px-6 py-4">
        {beforeCliff && (
          <p className="text-xs text-white/30 text-center mb-3">
            Tokens unlock after cliff date: {fmtDate(cliff)}
          </p>
        )}

        {!beforeCliff && !fullyVested && (
          <p className="text-xs text-white/30 text-center mb-3">
            Vesting ends in {hours}h {mins}m
          </p>
        )}

        {fullyVested && remaining > 0 && (
          <p className="text-xs text-emerald-400 text-center mb-3">
            Fully vested — remaining tokens can be claimed now
          </p>
        )}

        <button
          className={btnPrimary}
          onClick={() => claimTokens.mutate()}
          disabled={
            claimTokens.isPending ||
            claimable === 0 ||
            beforeCliff
          }
        >
          {claimTokens.isPending
            ? 'Claiming…'
            : beforeCliff
            ? 'Cliff not reached'
            : claimable === 0
            ? 'Nothing to claim yet'
            : `Claim ${claimable.toLocaleString()} tokens`}
        </button>
      </div>
    </div>
  )
}
"use client";

import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
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

// ─── helpers ────────────────────────────────────────────────────────────────
const toUnix = (v: string) => Math.floor(new Date(v).getTime() / 1000);
const fmtDate = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const short = (pk: string, n = 6) => `${pk.slice(0, n)}…${pk.slice(-4)}`;
const pct = (withdrawn: number, total: number) =>
  total === 0 ? 0 : Math.min(100, Math.round((withdrawn / total) * 100));

// ─── shared primitives ───────────────────────────────────────────────────────
function Pill({
  label,
  color,
}: {
  label: string;
  color: "green" | "amber" | "teal" | "gray";
}) {
  const map = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    gray: "bg-white/5 text-white/40 border-white/10",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${map[color]}`}
    >
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] uppercase tracking-widest text-white/30 mb-1">{label}</p>
      <p
        className={`text-2xl font-semibold tabular-nums ${
          accent ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-widest text-white/30">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all";

const btnPrimary =
  "w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-black font-semibold text-sm py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed";

const btnOutline =
  "w-full rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] active:scale-[0.98] text-white font-medium text-sm py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed";

// ─── VestingCreate ───────────────────────────────────────────────────────────
export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram();
  const { publicKey } = useWallet();
  const [company, setCompany] = useState("");
  const [mint, setMint] = useState("");

  if (!publicKey)
    return (
      <p className="text-center text-white/40 text-sm py-8">
        Connect your wallet to get started
      </p>
    );

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">New vesting account</h2>
        <p className="text-sm text-white/40 mt-0.5">
          Create a company-level vesting vault on-chain
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <FormField label="Company name">
          <input
            className={inputCls}
            placeholder="e.g. Acme Corp"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </FormField>
        <FormField label="Token mint address">
          <input
            className={inputCls}
            placeholder="3gzdWom…"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
          />
        </FormField>
      </div>
      <button
        className={btnPrimary}
        disabled={createVestingAccount.isPending || company.length === 0}
        onClick={() =>
          createVestingAccount.mutateAsync({ companyName: company, mint })
        }
      >
        {createVestingAccount.isPending ? "Creating…" : "Create vesting account"}
      </button>
    </div>
  );
}

// ─── VestingList ─────────────────────────────────────────────────────────────
export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram();

  if (getProgramAccount.isLoading)
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-emerald-400" />
      </div>
    );

  if (!getProgramAccount.data?.value)
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-5 text-sm text-amber-400 text-center">
        Program not found — make sure you&apos;re on the right cluster and the
        program is deployed.
      </div>
    );

  return (
    <div className="space-y-5">
      {accounts.isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-emerald-400" />
        </div>
      ) : accounts.data?.length ? (
        <div className="grid lg:grid-cols-2 gap-5">
          {accounts.data.map((account: any) => (
            <VestingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-white/30 text-sm">
          No vesting accounts yet — create one above.
        </div>
      )}
    </div>
  );
}

// ─── VestingCard ─────────────────────────────────────────────────────────────
function VestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVesting, employeeAccounts } =
    useVestingProgramAccount({ account });

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [cliffTime, setCliffTime] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [beneficiary, setBeneficiary] = useState("");
  const [showForm, setShowForm] = useState(false);

  const companyName = useMemo(
    () => accountQuery.data?.companyName ?? "",
    [accountQuery.data?.companyName]
  );

  const employees = employeeAccounts.data ?? [];
  const totalAllocated = employees.reduce(
    (s: number, e: any) => s + e.account.totalAmount.toNumber(),
    0
  );
  const totalWithdrawn = employees.reduce(
    (s: number, e: any) => s + e.account.totalWithdrawn.toNumber(),
    0
  );

  if (accountQuery.isLoading)
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 flex justify-center">
        <span className="loading loading-spinner text-emerald-400" />
      </div>
    );

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
      {/* header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3
              className="text-xl font-semibold text-white cursor-pointer hover:text-emerald-400 transition-colors"
              onClick={() => accountQuery.refetch()}
            >
              {companyName}
            </h3>
            <p className="text-xs text-white/30 mt-0.5 font-mono">
              {short(account.toString())}
            </p>
          </div>
          <Pill label="Active" color="teal" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Employees" value={employees.length} />
          <StatCard label="Allocated" value={totalAllocated.toLocaleString()} />
          <StatCard
            label="Claimed"
            value={totalWithdrawn.toLocaleString()}
            accent
          />
        </div>
      </div>

      {/* employee list */}
      <div className="px-6 py-4">
        <p className="text-[11px] uppercase tracking-widest text-white/30 mb-3">
          Employees
        </p>
        {employeeAccounts.isLoading ? (
          <span className="loading loading-spinner loading-sm text-white/30" />
        ) : employees.length ? (
          <div className="space-y-3">
            {employees.map((emp: any) => {
             const total = emp.account.totalAmount.toNumber();
const withdrawn = emp.account.totalWithdrawn.toNumber();

const now = Math.floor(Date.now() / 1000);

const start = emp.account.startTime.toNumber();
const cliff = emp.account.cliffTime.toNumber();
const end = emp.account.endTime.toNumber();

const beforeCliff = now < cliff;

let vested = 0;

if (beforeCliff) {
  vested = 0;
} else if (now >= end) {
  vested = total;
} else {
  vested = Math.floor(
    (total * (now - start)) / (end - start)
  );
}

const claimable = Math.max(0, vested - withdrawn);

const fullyVested = total > 0 && vested >= total;
const p = total === 0 ? 0 : Math.round((vested / total) * 100);
              return (
                <div
                  key={emp.publicKey.toString()}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                        {emp.account.beneficiary.toString().slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        className="text-sm text-white/70 font-mono"
                        title={emp.account.beneficiary.toString()}
                      >
                        {short(emp.account.beneficiary.toString())}
                      </span>
                    </div>
                    <Pill label={fullyVested ? "Fully vested" : `${p}%`} color={fullyVested ? "green" : "amber"} />
                  </div>
                  <ProgressBar value={p} />
                  <div className="flex justify-between mt-1.5 text-[11px] text-white/30">
                    <span>{withdrawn.toLocaleString()} claimed</span>
                    <span>{total.toLocaleString()} total</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-white/30">
                    <span>Start: {fmtDate(emp.account.startTime.toNumber())}</span>
                    <span className="text-center">Cliff: {fmtDate(emp.account.cliffTime.toNumber())}</span>
                    <span className="text-right">End: {fmtDate(emp.account.endTime.toNumber())}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-white/20 py-2">No employees yet</p>
        )}
      </div>

      {/* add employee */}
      <div className="px-6 pb-6">
        <button
          className={btnOutline}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "+ Add employee vesting"}
        </button>

        {showForm && (
          <div className="mt-4 space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <FormField label="Beneficiary wallet address">
              <input
                className={inputCls}
                placeholder="Paste public key…"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
              />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-3">
              <FormField label="Start date & time">
                <input
                  type="datetime-local"
                  className={inputCls}
                  onChange={(e) => setStartTime(toUnix(e.target.value))}
                />
              </FormField>
              <FormField label="End date & time">
                <input
                  type="datetime-local"
                  className={inputCls}
                  onChange={(e) => setEndTime(toUnix(e.target.value))}
                />
              </FormField>
              <FormField label="Cliff date & time">
                <input
                  type="datetime-local"
                  className={inputCls}
                  onChange={(e) => setCliffTime(toUnix(e.target.value))}
                />
              </FormField>
              <FormField label="Total allocation">
                <input
                  type="number"
                  className={inputCls}
                  placeholder="e.g. 1000"
                  min={0}
                  onChange={(e) => setTotalAmount(parseInt(e.target.value) || 0)}
                />
              </FormField>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2 text-[11px] text-white/30">
              Dates are automatically converted to Unix timestamps
            </div>
            <button
              className={btnPrimary}
              disabled={
                createEmployeeVesting.isPending ||
                !beneficiary ||
                !startTime ||
                !endTime ||
                !cliffTime ||
                !totalAmount
              }
              onClick={() =>
                createEmployeeVesting.mutateAsync({
                  startTime,
                  endTime,
                  totalAmount,
                  cliffTime,
                  beneficiary,
                })
              }
            >
              {createEmployeeVesting.isPending
                ? "Creating…"
                : "Create employee vesting account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VestingClaim ─────────────────────────────────────────────────────────────
export function VestingClaim() {
  const { publicKey } = useWallet();
  const { program } = useVestingProgram();
  const { cluster } = useCluster();

  const employeeAccounts = useQuery({
    queryKey: ["employee-accounts", { cluster, publicKey: publicKey?.toString() }],
    queryFn: async () => {
      if (!publicKey) return [];
      return program.account.employeeAccount.all([
        {
          memcmp: {
            offset: 8,
            bytes: publicKey.toBase58(),
          },
        },
      ]);
    },
    enabled: !!publicKey,
  });

  if (!publicKey)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-2xl">
          🔒
        </div>
        <p className="text-white/40 text-sm">
          Connect your beneficiary wallet to view claims
        </p>
      </div>
    );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">My vesting claims</h2>
        <p className="text-sm text-white/40 mt-0.5">
          Connected as{" "}
          <span className="font-mono text-white/60">
            {short(publicKey.toString())}
          </span>
        </p>
      </div>

      {employeeAccounts.isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-emerald-400" />
        </div>
      ) : employeeAccounts.data?.length ? (
        employeeAccounts.data.map((emp: any) => (
          <ClaimCard key={emp.publicKey.toString()} employeeAccount={emp} />
        ))
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] py-16 text-center text-white/30 text-sm">
          No vesting accounts found for this wallet
        </div>
      )}
    </div>
  );
}

// // ─── ClaimCard ────────────────────────────────────────────────────────────────
// function ClaimCard({ employeeAccount }: { employeeAccount: any }) {
//   const { program } = useVestingProgram();
//   const { cluster } = useCluster();
//   const transactionToast = useTransactionToast();
//   const { publicKey } = useWallet();

//   const claimTokens = useMutation({
//     mutationKey: ["claim-tokens", { cluster, pk: employeeAccount.publicKey.toString() }],
//     mutationFn: async () => {
//       const vestingAccount = await program.account.vestingAccount.fetch(
//         employeeAccount.account.vestingAccount
//       );
//       return program.methods
//         .claimTokens(vestingAccount.companyName)
//         .accounts({
//           beneficiary: publicKey,
//           employeeAccount: employeeAccount.publicKey,
//           vestingAccount: employeeAccount.account.vestingAccount,
//           mint: vestingAccount.mint,
//           treasuryTokenAccount: vestingAccount.treasuryTokenAccount,
//           tokenProgram: TOKEN_PROGRAM_ID,
//         })
//         .rpc();
//     },
//    onSuccess: (tx) => {
//   transactionToast(tx)
//   window.location.reload()
// },
//     onError: (e: any) => toast.error(`Claim failed: ${e.message}`),
//   });

//   const acc = employeeAccount.account;
//   const total = acc.totalAmount.toNumber();
//   const withdrawn = acc.totalWithdrawn.toNumber();
//   const claimable = total - withdrawn;
//   const p = pct(withdrawn, total);
//   const now = Math.floor(Date.now() / 1000);
//   const beforeCliff = now < acc.cliffTime.toNumber();

//   return (
//     <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
//       <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
//         <div className="flex items-start justify-between gap-3 mb-4">
//           <div>
//             <p className="text-xs text-white/30 font-mono">
//               Vesting account: {acc.vestingAccount.toString()}
//             </p>
//           </div>
//           <Pill
//             label={
//               beforeCliff
//                 ? "Before cliff"
//                 : claimable === 0
//                 ? "Fully claimed"
//                 : "Claimable"
//             }
//             color={beforeCliff ? "gray" : claimable === 0 ? "green" : "amber"}
//           />
//         </div>

//         <div className="grid grid-cols-3 gap-3 mb-4">
//           <StatCard label="Total" value={total.toLocaleString()} />
//           <StatCard label="Claimed" value={withdrawn.toLocaleString()} />
//           <StatCard
//             label="Available"
//             value={claimable.toLocaleString()}
//             accent={claimable > 0}
//           />
//         </div>

//         <ProgressBar value={p} />
//         <div className="flex justify-between mt-1.5 text-[11px] text-white/30">
//           <span>{p}% vested</span>
//           <span>{(100 - p)}% remaining</span>
//         </div>
//       </div>

//       <div className="px-6 py-4 grid sm:grid-cols-3 gap-3 border-b border-white/[0.06]">
//         <div className="text-center">
//           <p className="text-[11px] uppercase tracking-widest text-white/25 mb-0.5">Start</p>
//           <p className="text-xs text-white/60">{fmtDate(acc.startTime.toNumber())}</p>
//         </div>
//         <div className="text-center">
//           <p className="text-[11px] uppercase tracking-widest text-white/25 mb-0.5">Cliff</p>
//           <p className="text-xs text-white/60">{fmtDate(acc.cliffTime.toNumber())}</p>
//         </div>
//         <div className="text-center">
//           <p className="text-[11px] uppercase tracking-widest text-white/25 mb-0.5">End</p>
//           <p className="text-xs text-white/60">{fmtDate(acc.endTime.toNumber())}</p>
//         </div>
//       </div>

//       <div className="px-6 py-4">
//         {beforeCliff && (
//           <p className="text-xs text-white/30 text-center mb-3">
//             Tokens unlock after cliff date: {fmtDate(acc.cliffTime.toNumber())}
//           </p>
//         )}
//         <button
//           className={btnPrimary}
//           onClick={() => claimTokens.mutate()}
//           disabled={claimTokens.isPending || claimable === 0 || beforeCliff}
//         >
//           {claimTokens.isPending
//             ? "Claiming…"
//             : claimable === 0
//             ? "Nothing to claim"
//             : beforeCliff
//             ? "Cliff not reached"
//             : `Claim ${claimable.toLocaleString()} tokens`}
//         </button>
//       </div>
//     </div>
//   );
// }


// ─── ClaimCard ────────────────────────────────────────────────────────────────
function ClaimCard({ employeeAccount }: { employeeAccount: any }) {
  const { program } = useVestingProgram()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { publicKey } = useWallet()
  const [lol, setLol] = useState("")
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
  useEffect(() => {
  program.account.vestingAccount
    .fetch(acc.vestingAccount)
    .then((v: any) => {
      console.log(v.treasuryTokenAccount.toString())
      setLol(v.treasuryTokenAccount.toString())
    })
}, [])
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
              Vesting account: {lol}
             

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
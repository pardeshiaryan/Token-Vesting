"use client";

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

export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram();
  const { publicKey } = useWallet();
  const [company, setCompany] = useState("");
  const [mint, setMint] = useState("");

  const isFormValid = company.length > 0;

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createVestingAccount.mutateAsync({ companyName: company, mint: mint });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Company Name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      
      <input
        type="text"
        placeholder="Token Mint Address"
        value={mint}
        onChange={(e) => setMint(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={createVestingAccount.isPending || !isFormValid}
      >
        Create New Vesting Account {createVestingAccount.isPending && "..."}
      </button>
    </div>
  );
}

export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account:any) => (
            <VestingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

// function VestingCard({ account }: { account: PublicKey }) {
//   const { accountQuery, createEmployeeVesting } = useVestingProgramAccount({
//     account,
//   });
//   const [startTime, setStartTime] = useState(0);
//   const [endTime, setEndTime] = useState(0);
//   const [cliffTime, setCliffTime] = useState(0);
//   const [totalAmount, setTotalAmount] = useState(0);
// const [beneficiary, setBeneficiary] = useState("");

//   const companyName = useMemo(
//     () => accountQuery.data?.companyName ?? 0,
//     [accountQuery.data?.companyName]
//   );

//   return accountQuery.isLoading ? (
//     <span className="loading loading-spinner loading-lg"></span>
//   ) : (
//     <div className="card card-bordered border-base-300 border-4 text-neutral-content">
//       <div className="card-body items-center text-center">
//         <div className="space-y-6">
//           <h2
//             className="card-title justify-center text-3xl cursor-pointer"
//             onClick={() => accountQuery.refetch()}
//           >
//             {companyName}
//           </h2>
//           <div className="card-actions justify-around">
//             <input
//               type="text"
//               placeholder="Start Time"
//               value={startTime || ""}
//               onChange={(e) => setStartTime(parseInt(e.target.value))}
//               className="input input-bordered w-full max-w-xs"
//             />
//             <input
//               type="text"
//               placeholder="End Time"
//               value={endTime || ""}
//               onChange={(e) => setEndTime(parseInt(e.target.value))}
//               className="input input-bordered w-full max-w-xs"
//             />
//             <input
//               type="text"
//               placeholder="Cliff Time"
//               value={cliffTime || ""}
//               onChange={(e) => setCliffTime(parseInt(e.target.value))}
//               className="input input-bordered w-full max-w-xs"
//             />
//             <input
//               type="text"
//               placeholder="Total Allocation"
//               value={totalAmount || ""}
//               onChange={(e) => setTotalAmount(parseInt(e.target.value))}
//               className="input input-bordered w-full max-w-xs"
//             />
//             <input
//   type="text"
//   placeholder="Beneficiary Wallet Address"
//   value={beneficiary}
//   onChange={(e) => setBeneficiary(e.target.value)}
//   className="input input-bordered w-full max-w-xs"
// />

//             <button
//               className="btn btn-xs lg:btn-md btn-outline"
//               onClick={() =>
//   createEmployeeVesting.mutateAsync({
//     startTime,
//     endTime,
//     totalAmount,
//     cliffTime,
//     beneficiary,
//   })
// }
              
//               disabled={createEmployeeVesting.isPending}
//             >
//               Create Employee Vesting Account
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


function VestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVesting, employeeAccounts } =
    useVestingProgramAccount({ account });

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [cliffTime, setCliffTime] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [beneficiary, setBeneficiary] = useState("");

  const companyName = useMemo(
    () => accountQuery.data?.companyName ?? "",
    [accountQuery.data?.companyName]
  );

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {companyName}
          </h2>

          {/* Employee list */}
          <div className="w-full">
            <h3 className="text-lg font-bold mb-2">Employee Vesting Accounts</h3>
            {employeeAccounts.isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : employeeAccounts.data?.length ? (
              <table className="table table-xs w-full text-left">
                <thead>
                  <tr>
                    <th>Beneficiary</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Cliff</th>
                    <th>Total</th>
                    <th>Withdrawn</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeAccounts.data.map((emp: any) => (
                    <tr key={emp.publicKey.toString()}>
                      <td title={emp.account.beneficiary.toString()}>
                        {emp.account.beneficiary.toString().slice(0, 8)}...
                      </td>
                      <td>{emp.account.startTime.toString()}</td>
                      <td>{emp.account.endTime.toString()}</td>
                      <td>{emp.account.cliffTime.toString()}</td>
                      <td>{emp.account.totalAmount.toString()}</td>
                      <td>{emp.account.totalWithdrawn.toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm opacity-60">No employees yet</p>
            )}
          </div>

          {/* Create employee form */}
          <div className="card-actions justify-around">
            <input
              type="text"
              placeholder="Beneficiary Wallet Address"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              className="input input-bordered w-full max-w-xs"
            />
            {/* <input
              type="text"
              placeholder="Start Time"
              value={startTime || ""}
              onChange={(e) => setStartTime(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <input
              type="text"
              placeholder="End Time"
              value={endTime || ""}
              onChange={(e) => setEndTime(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <input
              type="text"
              placeholder="Cliff Time"
              value={cliffTime || ""}
              onChange={(e) => setCliffTime(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            /> */}
            
<input
  type="datetime-local"
  onChange={(e) => setStartTime(Math.floor(new Date(e.target.value).getTime() / 1000))}
  className="input input-bordered w-full max-w-xs"
/>
<input
  type="datetime-local"
  onChange={(e) => setEndTime(Math.floor(new Date(e.target.value).getTime() / 1000))}
  className="input input-bordered w-full max-w-xs"
/>
<input
  type="datetime-local"
  onChange={(e) => setCliffTime(Math.floor(new Date(e.target.value).getTime() / 1000))}
  className="input input-bordered w-full max-w-xs"
/>
            <input
              type="text"
              placeholder="Total Allocation"
              value={totalAmount || ""}
              onChange={(e) => setTotalAmount(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() =>
                createEmployeeVesting.mutateAsync({
                  startTime,
                  endTime,
                  totalAmount,
                  cliffTime,
                  beneficiary,
                })
              }
              disabled={createEmployeeVesting.isPending}
            >
              Create Employee Vesting Account{" "}
              {createEmployeeVesting.isPending && "..."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export function VestingClaim() {
  const { publicKey } = useWallet();
  const { program } = useVestingProgram();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();

  // Fetch all employee accounts where beneficiary = connected wallet
  const employeeAccounts = useQuery({
    queryKey: ["employee-accounts", { cluster, publicKey }],
    queryFn: async () => {
      if (!publicKey) return [];
      return program.account.employeeAccount.all([
        {
          memcmp: {
            offset: 8, // beneficiary is first field after discriminator
            bytes: publicKey.toBase58(),
          },
        },
      ]);
    },
    enabled: !!publicKey,
  });

  if (!publicKey) return <p>Connect your wallet to claim tokens</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">My Vesting Claims</h2>
      {employeeAccounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : employeeAccounts.data?.length ? (
        employeeAccounts.data.map((emp: any) => (
          <ClaimCard
            key={emp.publicKey.toString()}
            employeeAccount={emp}
          />
        ))
      ) : (
        <p className="text-center opacity-60">No vesting accounts found for your wallet</p>
      )}
    </div>
  );
}

function ClaimCard({ employeeAccount }: { employeeAccount: any }) {
  const { program } = useVestingProgram();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { publicKey } = useWallet();

  const claimTokens = useMutation({
    mutationKey: ["claim-tokens", { cluster }],
    mutationFn: async () => {
      // Fetch the vesting account to get company name
      const vestingAccount = await program.account.vestingAccount.fetch(
        employeeAccount.account.vestingAccount
      );

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
        .rpc();
    },
    onSuccess: (tx) => transactionToast(tx),
    onError: (e) => toast.error(`Claim failed: ${e.message}`),
  });

  const acc = employeeAccount.account;
  const claimable = acc.totalAmount.toNumber() - acc.totalWithdrawn.toNumber();

  return (
    <div className="card card-bordered border-base-300 border-4">
      <div className="card-body">
        <p>Vesting Account: {acc.vestingAccount.toString().slice(0, 12)}...</p>
        <p>Total Amount: {acc.totalAmount.toString()}</p>
        <p>Withdrawn: {acc.totalWithdrawn.toString()}</p>
        <p>Claimable: {claimable}</p>
        <button
          className="btn btn-primary"
          onClick={() => claimTokens.mutate()}
          disabled={claimTokens.isPending || claimable === 0}
        >
          {claimTokens.isPending ? "Claiming..." : "Claim Tokens"}
        </button>
      </div>
    </div>
  );
}
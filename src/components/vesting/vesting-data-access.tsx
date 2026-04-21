'use client';

// import { getvestingProgram, getvestingProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { BN } from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";

// import { getVestingProgram, getVestingProgramId } from "@token-vesting/anchor";
import { getVestingProgram, getVestingProgramId } from "../../../anchor/src/token-vesting";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

interface CreateVestingArgs {
  companyName: string;
  mint: string;
}

interface CreateEmployeeArgs {
  startTime: number;
  endTime: number;
  totalAmount: number;
  cliffTime: number;
    beneficiary: string;
}

export function useVestingProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getVestingProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getVestingProgram(provider);

  const accounts = useQuery({
    queryKey: ["vesting", "all", { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createVestingAccount = useMutation<string, Error, CreateVestingArgs>({
    mutationKey: ["vestingAccount", "create", { cluster }],
    mutationFn: ({ companyName, mint }) =>
      program.methods
        .createVestingAccount(companyName)
        .accounts({ mint: new PublicKey(mint), tokenProgram: TOKEN_PROGRAM_ID })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to initialize account"),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createVestingAccount,
  };
}

export function useVestingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useVestingProgram();

  const accountQuery = useQuery({
    queryKey: ["vesting", "fetch", { cluster, account }],
    queryFn: () => program.account.vestingAccount.fetch(account),
  });
  const employeeAccounts = useQuery({
  queryKey: ["vesting", "employees", { cluster, account }],
  queryFn: () =>
    program.account.employeeAccount.all([
      {
        memcmp: {
          offset: 8 + 32 + 8 + 8 + 8 + 8 + 8, // offset to vesting_account field
          bytes: account.toBase58(),
        },
      },
    ]),
});

  // const createEmployeeVesting = useMutation<string, Error, CreateEmployeeArgs>({
  //   mutationKey: ["vesting", "close", { cluster, account }],
  //   mutationFn: ({ startTime, endTime, totalAmount, cliffTime }) =>
  //     program.methods
  //       .createEmployeeVesting(startTime, endTime, totalAmount, cliffTime)
  //       .rpc(),
  //   onSuccess: (tx) => {
  //     transactionToast(tx);
  //     return accounts.refetch();
  //   },
  // });
  const createEmployeeVesting = useMutation<string, Error, CreateEmployeeArgs>({
  mutationKey: ["vesting", "create-employee", { cluster, account }],
  mutationFn: async ({ startTime, endTime, totalAmount, cliffTime, beneficiary }) => {
    const beneficiaryPubkey = new PublicKey(beneficiary);

    const companyName = accountQuery.data?.companyName;
    if (!companyName) throw new Error("Company name not found");

    const [vestingAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(companyName)],
      program.programId
    );

    const [employeeAccountPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee_vesting"),
        beneficiaryPubkey.toBuffer(),
        vestingAccountPDA.toBuffer(),
      ],
      program.programId
    );

    return program.methods
      .createEmployeeVesting(
        new BN(startTime),
        new BN(endTime),
        new BN(totalAmount),
        new BN(cliffTime)
      )
      .accounts({
        owner: program.provider.publicKey,
        beneficiary: beneficiaryPubkey,
        vestingAccount: vestingAccountPDA,
        employeeAccount: employeeAccountPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  },
  onSuccess: (tx) => {
    transactionToast(tx);
    return accounts.refetch();
  },
});

  return {
    accountQuery,
    createEmployeeVesting,
     employeeAccounts,
  };
}
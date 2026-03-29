// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import vestingIDL from '../target/idl/vesting.json'
import type { Vesting } from '../target/types/vesting'

// Re-export the generated IDL and type
export { Vesting, vestingIDL }

// The programId is imported from the program IDL.
export const vesting_PROGRAM_ID = new PublicKey(vestingIDL.address)

// This is a helper function to get the vesting Anchor program.
export function getVestingProgram(provider: AnchorProvider, address?: PublicKey): Program<Vesting> {
  return new Program({ ...vestingIDL, address: address ? address.toBase58() : vestingIDL.address } as Vesting, provider)
}

// This is a helper function to get the program ID for the vesting program depending on the cluster.
export function getVestingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the vesting program on devnet and testnet.
      return new PublicKey('sLVbQEewvKfm7t4G7T7Qjh1iS85mnVrVEwPZAc4hXYz')
    case 'mainnet-beta':
    default:
      return vesting_PROGRAM_ID
  }
}

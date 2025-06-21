import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  Keypair,
} from "@solana/web3.js";

export function createReadonlyProvider(
  connection: Connection,
  publicKey: PublicKey
): AnchorProvider {
  const dummyWallet: Wallet = {
    publicKey,
    payer: Keypair.generate(),
    signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => tx,
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => txs,
  };

  return new AnchorProvider(connection, dummyWallet, { commitment: "confirmed" });
}

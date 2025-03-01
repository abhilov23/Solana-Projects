'use client'

import { getCruddappProgram, getCruddappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import * as anchor from '@project-serum/anchor'

interface EntryArgs {
  owner: PublicKey,
  title: string,
  message: string,
}

export function useCruddappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCruddappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCruddappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['cruddapp', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['cruddapp', 'create', { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      const [journalEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId,
      );
      return program.methods.createEntry(title, message).accounts({
        journalEntry: journalEntryAddress,
        owner,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to create entry'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  }
}

export function useCruddappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { programId , program, accounts } = useCruddappProgram()

  const accountQuery = useQuery({
    queryKey: ['cruddapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })

  const updateEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['cruddapp', 'update', { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      const [journalEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId,
      );
      return program.methods.updateEntry(title, message).accounts({
        journalEntry: journalEntryAddress,
        owner,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to update entry'),
  })

  const deleteEntry = useMutation({
    mutationKey: ['cruddapp', 'delete', { cluster, account }],
    mutationFn: async ({ title, owner }: { title: string; owner: PublicKey }) => {
      const [journalEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title), owner.toBuffer()],
        programId,
      );
      return program.methods.deleteEntry(title).accounts({
        journalEntry: journalEntryAddress,
        owner,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to delete entry'),
  })

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  }
}

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
  owner: PublicKey
  title: string
  message: string
}

interface DeleteEntryArgs {
  title: string
  owner: PublicKey
}

// Add type for journal entry state
interface JournalEntryState {
  owner: PublicKey
  title: string
  message: string
  entryId: anchor.BN
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
    retry: (failureCount, error) => {
      // Don't retry if it's a program account not found error
      if (error?.message?.includes('Account does not exist')) {
        return false
      }
      return failureCount < 3
    },
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
    retry: 2,
  })

  const createEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['cruddapp', 'create', { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      // Input validation
      if (!title.trim()) {
        throw new Error('Title cannot be empty')
      }
      if (!message.trim()) {
        throw new Error('Message cannot be empty')
      }
      if (title.length > 50) {
        throw new Error('Title must be 50 characters or less')
      }
      if (message.length > 500) {
        throw new Error('Message must be 500 characters or less')
      }

      try {
        const [journalEntryAddress] = await PublicKey.findProgramAddress(
          [Buffer.from(title.trim()), owner.toBuffer()],
          programId,
        )

        return program.methods
          .createEntry(title.trim(), message.trim())
          .accounts({
            journalEntry: journalEntryAddress,
            owner,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc()
      } catch (error) {
        if (error?.message?.includes('already in use')) {
          throw new Error('An entry with this title already exists')
        }
        throw error
      }
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      accounts.refetch()
      toast.success('Entry created successfully!')
    },
    onError: (error) => {
      console.error('Create entry error:', error)
      toast.error(error.message || 'Failed to create entry')
    },
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
  const { programId, program, accounts } = useCruddappProgram()

  const accountQuery = useQuery({
    queryKey: ['cruddapp', 'fetch', { cluster, account: account.toString() }],
    queryFn: () => program.account.journalEntryState.fetch(account),
    retry: (failureCount, error) => {
      if (error?.message?.includes('Account does not exist')) {
        return false
      }
      return failureCount < 2
    },
    enabled: !!account,
  })

  const updateEntry = useMutation<string, Error, EntryArgs>({
    mutationKey: ['cruddapp', 'update', { cluster, account: account.toString() }],
    mutationFn: async ({ title, message, owner }) => {
      // Input validation
      if (!title.trim()) {
        throw new Error('Title cannot be empty')
      }
      if (!message.trim()) {
        throw new Error('Message cannot be empty')
      }
      if (message.length > 500) {
        throw new Error('Message must be 500 characters or less')
      }

      try {
        const [journalEntryAddress] = await PublicKey.findProgramAddress(
          [Buffer.from(title.trim()), owner.toBuffer()],
          programId,
        )

        return program.methods
          .updateEntry(title.trim(), message.trim())
          .accounts({
            journalEntry: journalEntryAddress,
            owner,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc()
      } catch (error) {
        if (error?.message?.includes('Account does not exist')) {
          throw new Error('Entry not found')
        }
        throw error
      }
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      accountQuery.refetch()
      accounts.refetch()
      toast.success('Entry updated successfully!')
    },
    onError: (error) => {
      console.error('Update entry error:', error)
      toast.error(error.message || 'Failed to update entry')
    },
  })

  const deleteEntry = useMutation<string, Error, DeleteEntryArgs>({
    mutationKey: ['cruddapp', 'delete', { cluster, account: account.toString() }],
    mutationFn: async ({ title, owner }) => {
      if (!title.trim()) {
        throw new Error('Title cannot be empty')
      }

      try {
        const [journalEntryAddress] = await PublicKey.findProgramAddress(
          [Buffer.from(title.trim()), owner.toBuffer()],
          programId,
        )

        // The IDL shows the parameter name is "_title" not "title"
        return program.methods
          .deleteEntry(title.trim())
          .accounts({
            journalEntry: journalEntryAddress,
            owner,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc()
      } catch (error) {
        if (error?.message?.includes('Account does not exist')) {
          throw new Error('Entry not found')
        }
        throw error
      }
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      accounts.refetch()
      toast.success('Entry deleted successfully!')
    },
    onError: (error) => {
      console.error('Delete entry error:', error)
      toast.error(error.message || 'Failed to delete entry')
    },
  })

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  }
}
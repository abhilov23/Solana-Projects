'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCruddappProgram, useCruddappProgramAccount } from './cruddapp-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export function CruddappCreate() {
  const { createEntry } = useCruddappProgram()
  const { publicKey } = useWallet();
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")

  const isFormValid = title.trim() !== "" && message.trim() !== "";

  const handleSubmit = async () => {
    if (publicKey && isFormValid) {
      try {
        await createEntry.mutateAsync({ title, message, owner: publicKey });
      } catch (error) {
        console.error("Error creating entry:", error);
      }
    }
  }

  if (!publicKey) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Please connect to a wallet to create entries.</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type='text'
        placeholder='Title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className='input input-bordered w-full max-w-xs'
      />
      <textarea
        placeholder='Message'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className='textarea input-bordered w-full max-w-xs h-32'
      />
      <button
        className="btn btn-md btn-primary"
        onClick={handleSubmit}
        disabled={createEntry.isPending || !isFormValid}
      >
        Create {createEntry.isPending && '...'}
      </button>
    </div>
  )
}

export function CruddappList() {
  const { accounts, getProgramAccount } = useCruddappProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className='space-y-6'>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CruddappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className='text-2xl'>No accounts</h2>
          <p>No accounts found. Create one above to get started.</p>
        </div>
      )}
    </div>
  )
}

function CruddappCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCruddappProgramAccount({ account })

  const { publicKey } = useWallet();
  const [message, setMessage] = useState("")
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() !== "";

  const handleSubmit = async () => {
    if (publicKey && isFormValid && title) {
      try {
        await updateEntry.mutateAsync({ title, message, owner: publicKey });
      } catch (error) {
        console.error("Error updating entry:", error);
      }
    }
  }

  if (!publicKey) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Please connect to a wallet to create entries.</span>
      </div>
    )
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-4">
          <h2 className="card-title text-3xl cursor-pointer" onClick={() => accountQuery.refetch()}>
            {accountQuery.data?.title}
          </h2>
          <p>{accountQuery.data?.message}</p>
          <div className="card-actions flex flex-col items-center">
            <textarea
              placeholder='New Message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='textarea input-bordered w-full max-w-xs h-32'
            />
            <button
              className="btn btn-md btn-primary mt-2"
              onClick={handleSubmit}
              disabled={updateEntry.isPending || !isFormValid}
            >
              Update {updateEntry.isPending && '...'}
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (!window.confirm('Are you sure you want to close this account?')) {
                  return
                }
                const title = accountQuery.data?.title;
                if (title) {
                  deleteEntry.mutateAsync(title).catch(error => console.error("Error deleting entry:", error));
                }
              }}
              disabled={deleteEntry.isPending}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client";

import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useCruddappProgram, useCruddappProgramAccount } from "./cruddapp-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

export function CruddappCreate() {
  const { createEntry } = useCruddappProgram();
  const { publicKey } = useWallet();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const isFormValid = title.trim() !== "" && message.trim() !== "";

  const handleSubmit = async () => {
    if (publicKey && isFormValid) {
      try {
        await createEntry.mutateAsync({ title: title.trim(), message: message.trim(), owner: publicKey });
        // Clear form on success
        setTitle("");
        setMessage("");
      } catch (error) {
        console.error("Error creating entry:", error);
      }
    }
  };

  if (!publicKey) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Please connect to a wallet to create entries.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="text"
        placeholder="Title (max 50 characters)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full max-w-xs"
        maxLength={50}
      />
      <textarea
        placeholder="Message (max 500 characters)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="textarea input-bordered w-full max-w-xs h-32"
        maxLength={500}
      />
      <div className="text-sm text-gray-500">
        Title: {title.length}/50 | Message: {message.length}/500
      </div>
      <button
        className="btn btn-md btn-primary"
        onClick={handleSubmit}
        disabled={createEntry.isPending || !isFormValid}
      >
        Create {createEntry.isPending && "..."}
      </button>
    </div>
  );
}

export function CruddappList() {
  const { accounts, getProgramAccount } = useCruddappProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.error ? (
        <div className="alert alert-error">
          <span>Error loading entries: {accounts.error.message}</span>
        </div>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CruddappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl">No accounts</h2>
          <p>No accounts found. Create one above to get started.</p>
        </div>
      )}
    </div>
  );
}

function CruddappCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCruddappProgramAccount({ account });
  const { publicKey } = useWallet();
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Get the data from the query
  const entryData = accountQuery.data;
  const title = entryData?.title;
  const currentMessage = entryData?.message;
  const owner = entryData?.owner;

  const isFormValid = message.trim() !== "";
  const isOwner = publicKey && owner && publicKey.equals(owner);

  const handleSubmit = async () => {
    if (publicKey && isFormValid && title && isOwner) {
      try {
        await updateEntry.mutateAsync({ 
          title, 
          message: message.trim(), 
          owner: publicKey 
        });
        setMessage("");
        setIsEditing(false);
        toast.success("Entry updated successfully!");
      } catch (error) {
        console.error("Error updating entry:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (!publicKey || !title || !isOwner) {
      toast.error("Cannot delete: You don't own this entry or wallet not connected.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      try {
        await deleteEntry.mutateAsync({ title, owner: publicKey });
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  const handleEdit = () => {
    setMessage(currentMessage || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setMessage("");
    setIsEditing(false);
  };

  if (!publicKey) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Please connect to a wallet to manage entries.</span>
      </div>
    );
  }

  if (accountQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (accountQuery.error) {
    return (
      <div className="card card-bordered border-red-300 border-4">
        <div className="card-body">
          <div className="alert alert-error">
            <span>Error loading entry: {accountQuery.error.message}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!entryData) {
    return (
      <div className="card card-bordered border-gray-300 border-4">
        <div className="card-body">
          <div className="alert alert-warning">
            <span>Entry not found</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-4 w-full">
          <h2 
            className="card-title text-3xl cursor-pointer hover:text-primary" 
            onClick={() => accountQuery.refetch()}
            title="Click to refresh"
          >
            {title || "Untitled"}
          </h2>
          
          <p className="text-lg">{currentMessage || "No message"}</p>
          
          {/* Owner info */}
          <div className="text-sm text-gray-500">
            <p>Owner: {ellipsify(owner?.toString() || "")}</p>
            {!isOwner && <p className="text-yellow-500">You don't own this entry</p>}
          </div>

          {/* Edit/Update Section - only show if user owns the entry */}
          {isOwner && (
            <div className="card-actions flex flex-col items-center w-full">
              {!isEditing ? (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={handleEdit}
                >
                  Edit Message
                </button>
              ) : (
                <div className="w-full space-y-2">
                  <textarea
                    placeholder="New Message (max 500 characters)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="textarea input-bordered w-full h-32"
                    maxLength={500}
                  />
                  <div className="text-sm text-gray-500">
                    {message.length}/500 characters
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleSubmit}
                      disabled={updateEntry.isPending || !isFormValid}
                    >
                      Update {updateEntry.isPending && "..."}
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={handleCancelEdit}
                      disabled={updateEntry.isPending}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account and Delete Section */}
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink 
                path={`account/${account}`} 
                label={ellipsify(account.toString())} 
              />
            </p>
            
            {isOwner && (
              <button
                className="btn btn-xs btn-error btn-outline"
                onClick={handleDelete}
                disabled={deleteEntry.isPending || !title}
              >
                {deleteEntry.isPending ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
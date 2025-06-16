"use client";
import { useState } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import idl from "./idl.json"; // Import IDL (you will generate this)
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");

  const PROGRAM_ID = new PublicKey("6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF"); // Replace with your deployed program ID

  const handleTransfer = async () => {
    if (!publicKey) {
      toast.error("Connect your wallet first!");
      return;
    }
    if (!receiver || !amount) {
      toast.error("Enter receiver address and amount");
      return;
    }

    try {
      const provider = new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
      const program = new Program(idl, PROGRAM_ID, provider);

      const senderTokenAccount = new PublicKey(""); // Fetch dynamically or hardcode it
      const receiverTokenAccount = new PublicKey(""); // Fetch dynamically or hardcode it

      const tx = await program.rpc.transferTokens(new BN(amount), {
        accounts: {
          sender: publicKey,
          receiver: new PublicKey(receiver),
          senderTokenAccount,
          receiverTokenAccount,
          tokenProgram: web3.SystemProgram.programId,
        },
      });

      toast.success(`Transaction successful: ${tx}`);
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Solana Token Transfer</h1>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Receiver Address"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white w-80"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 rounded bg-gray-800 text-white w-80"
        />
        <button
          onClick={handleTransfer}
          className="bg-blue-500 p-3 rounded-lg font-bold hover:bg-blue-600"
        >
          Transfer Tokens
        </button>
      </div>
    </div>
  );
}

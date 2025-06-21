import { loadKeypairSignerFromFile } from 'gill/node';
import { createSolanaClient, createTransaction, generateKeyPairSigner, signTransactionMessageWithSigners, getSignatureFromTransaction, getExplorerLink } from "gill";
import { buildCreateTokenTransaction, TOKEN_PROGRAM_ADDRESS } from "gill/programs/token";

async function main() {
  try {
    // Create Solana client for devnet
    const { rpc, sendAndConfirmTransaction } = createSolanaClient({
      urlOrMoniker: "devnet"
    });

    // Load keypair from file (default: ~/.config/solana/id.json)
    const signer = await loadKeypairSignerFromFile();
    console.log("Loaded signer with address:", signer.address);

    // Get latest blockhash
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    console.log("Latest blockhash:", latestBlockhash.blockhash);

    // Generate a new keypair for the mint
    const mint = await generateKeyPairSigner();
    console.log("Generated mint address:", mint.address);

    // Build the create token transaction
    const tx = await buildCreateTokenTransaction({
      feePayer: signer,
      latestBlockhash,
      mint,
      metadata: {
        isMutable: true,
        name: "ILY token",
        symbol: "ILY",
        uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/Climate/metadata.json",
      },
      decimals: 9,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
      // Optional: Set compute unit limit and price for better transaction success rate
      // computeUnitLimit: 200000,
      // computeUnitPrice: 1000000, // 0.001 SOL per compute unit
    });

    console.log("Built transaction successfully");

    // Sign the transaction
    const signedTx = await signTransactionMessageWithSigners(tx);
    console.log("Transaction signed");

    // Get the transaction signature before sending
    const signature = getSignatureFromTransaction(signedTx);
    console.log("Transaction signature:", signature);

    // Get explorer link
    const explorerLink = getExplorerLink({
      cluster: "devnet",
      transaction: signature
    });
    console.log("Explorer link:", explorerLink);

    // Send and confirm the transaction
    console.log("Sending transaction...");
    await sendAndConfirmTransaction(signedTx, {
      commitment: "confirmed",
      skipPreflight: false
    });

    console.log("✅ Token created successfully!");
    console.log("Mint address:", mint.address);
    console.log("Transaction signature:", signature);
    console.log("View on Solana Explorer:", explorerLink);

  } catch (error) {
    console.error("❌ Error creating token:", error);    
  }
}

// Run the main function
main().catch(console.error);
import { loadKeypairSignerFromFile } from 'gill/node';
import { 
  createSolanaClient, 
  signTransactionMessageWithSigners, 
  getSignatureFromTransaction, 
  getExplorerLink,
  address 
} from "gill";
import { buildTransferTokensTransaction, TOKEN_PROGRAM_ADDRESS } from "gill/programs/token";

async function transferTokens() {
  try {
    // Connect to Solana devnet
    const { rpc, sendAndConfirmTransaction } = createSolanaClient({
      urlOrMoniker: "devnet"
    });

    // Load your wallet (the one that owns the tokens)
    const sender = await loadKeypairSignerFromFile();
    console.log("Sending from wallet:", sender.address);

    // Get latest blockhash
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    const MINT_ADDRESS = "YOUR_MINT_ADDRESS_HERE";  // Token mint address
    const RECIPIENT_ADDRESS = "RECIPIENT_WALLET_ADDRESS_HERE"; // Where to send tokens
    
    // Build transfer transaction
    const transferTx = await buildTransferTokensTransaction({
      feePayer: sender,
      latestBlockhash,
      mint: address(MINT_ADDRESS),
      authority: sender, // The wallet that owns the tokens
      amount: 100_000_000_000, // 100 tokens (with 9 decimals)
      destination: address(RECIPIENT_ADDRESS),
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
      // sourceAta: // Optional: specify source token account if not default
    });

    // Sign transaction
    const signedTx = await signTransactionMessageWithSigners(transferTx);
    
    // Get signature and explorer link
    const signature = getSignatureFromTransaction(signedTx);
    const explorerLink = getExplorerLink({
      cluster: "devnet",
      transaction: signature
    });

    console.log("Sending transaction...");
    console.log("Explorer link:", explorerLink);

    // Send and confirm
    await sendAndConfirmTransaction(signedTx);

    console.log("✅ SUCCESS! Transferred 100 tokens");
    console.log("From:", sender.address);
    console.log("To:", RECIPIENT_ADDRESS);
    console.log("Transaction:", signature);

  } catch (error) {
    console.error("❌ Error:", error);

  }
}

transferTokens();
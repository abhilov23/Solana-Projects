import { loadKeypairSignerFromFile } from 'gill/node';
import { 
  createSolanaClient, 
  signTransactionMessageWithSigners, 
  getSignatureFromTransaction, 
  getExplorerLink,
  address 
} from "gill";
import { buildMintTokensTransaction, TOKEN_PROGRAM_ADDRESS } from "gill/programs/token";

async function mintTokens() {
  try {
    // Connect to Solana devnet
    const { rpc, sendAndConfirmTransaction } = createSolanaClient({
      urlOrMoniker: "devnet"
    });

    // Load your wallet (must be the mint authority)
    const mintAuthority = await loadKeypairSignerFromFile();
    console.log("Using wallet:", mintAuthority.address);

    // Get latest blockhash
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    // ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES:
    const MINT_ADDRESS = "YOUR_MINT_ADDRESS_HERE";  // From token creation
    const RECIPIENT_ADDRESS = "RECIPIENT_WALLET_ADDRESS_HERE"; // Where to send tokens
    
    // Build mint transaction
    const mintTx = await buildMintTokensTransaction({
      feePayer: mintAuthority,
      latestBlockhash,
      mint: address(MINT_ADDRESS),
      mintAuthority: mintAuthority,
      amount: 1000_000_000_000, // 1000 tokens (with 9 decimals)
      destination: address(RECIPIENT_ADDRESS),
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    // Sign transaction
    const signedTx = await signTransactionMessageWithSigners(mintTx);
    
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

    console.log("✅ SUCCESS! Minted 1000 tokens");
    console.log("Transaction:", signature);

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

mintTokens();
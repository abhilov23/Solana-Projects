import {Connection,Transaction,SystemProgram,sendAndConfirmTransaction,PublicKey,} from "@solana/web3.js";
  import "dotenv/config";
  import { getKeypairFromEnvironment } from "@solana-developers/helpers";
   
  //public key of the receiver
  const suppliedToPubkey = process.argv[2] || null; 
   
  if (!suppliedToPubkey) {
    console.log(`Please provide a public key to send to`);
    process.exit(1);
  }
   
  //secret key of the sender
  const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");
   
  console.log(`suppliedToPubkey: ${suppliedToPubkey}`);
   
  const toPubkey = new PublicKey(suppliedToPubkey); //setting the public key
   
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
   
  console.log(`✅ Loaded our own keypair, the destination public key, and connected to Solana`);   


  const transaction = new Transaction(); //creating a new transaction
   
  const LAMPORTS_TO_SEND = 5000; //amount to send
   
  const sendSolInstruction = SystemProgram.transfer({ //setting the transfer
    fromPubkey: senderKeypair.publicKey, 
    toPubkey,
    lamports: LAMPORTS_TO_SEND,
  });
   
  transaction.add(sendSolInstruction); //adding the transaction
   
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    senderKeypair,
  ]);
   
  console.log(
    `💸 Finished! Sent ${LAMPORTS_TO_SEND} to the address ${toPubkey}. `,
  );
  console.log(`Transaction signature is ${signature}!`);
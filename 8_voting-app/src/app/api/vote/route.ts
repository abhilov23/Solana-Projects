import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import BN from "bn.js";

import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import VOTING_IDL from "../../../../anchor/target/idl/voting.json" assert { type: "json" };
import type { Voting } from "../../../../anchor/target/types/voting";
import { createReadonlyProvider } from "lib/anchorProvider";


const PROGRAM_ID = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");
const POLL_ID = new BN(1); // Example poll ID — make sure this exists on-chain

export const OPTIONS = GET;

export async function GET(request: Request) {
  const ActionMetadata: ActionGetResponse = {
    icon: "https://pintola.in/cdn/shop/files/High_Protein_Dark_Chocolate_Crunchy_510gm_600x600_a824f0ab-a9dd-4120-8b4c-3ff571aeb645_600x.jpg?v=1732089677",
    title: "Vote for your favorite type of peanut butter",
    description: "Vote between crunchy and smooth peanut butter",
    label: "Vote",
    links: {
  actions: [
    {
      type: "post",
      label: "Crunchy",
      href: "/api/vote?candidate=crunchy"
    },
    {
      type: "post",
      label: "Smooth",
      href: "/api/vote?candidate=smooth"
    }
  ]
 }
  };

  return Response.json(ActionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const rawCandidate = url.searchParams.get("candidate");

  const candidate = rawCandidate?.toLowerCase();
  if (candidate !== "crunchy" && candidate !== "smooth") {
    return Response.json({ error: "Invalid candidate" }, { status: 400, headers: ACTIONS_CORS_HEADERS });
  }

  const body: ActionPostRequest = await request.json();
  let voter: PublicKey;

  try {
    voter = new PublicKey(body.account);
  } catch {
    return new Response('Invalid "account" provided', {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const provider = createReadonlyProvider(connection, voter);
const program = new Program<Voting>(VOTING_IDL as any ,provider); 

  // Derive poll PDA
  const [pollAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("poll"), POLL_ID.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );

  // Derive candidate PDA
  const [candidateAccount] = PublicKey.findProgramAddressSync(
    [POLL_ID.toArrayLike(Buffer, "le", 8), Buffer.from(candidate)],
    PROGRAM_ID
  );

  const instruction = await program.methods
    .vote(POLL_ID, candidate)
    .accounts({
  signer: voter,
  poll_account: pollAccount,
  candidate_account: candidateAccount, // ✅ match IDL
}).instruction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction,
    },
  });

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { LinkedAction } from './../../../../node_modules/@solana/actions-spec/index.d';
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions"

import { Voting } from '@/../anchor/target/types/voting';
const IDL = require('../../../../anchor/target/idl/voting.json')


export const OPTIONS = GET;

export async function GET(request: Request){
    const ActionMetadata: ActionGetResponse ={
         icon: "https://pintola.in/cdn/shop/files/High_Protein_Dark_Chocolate_Crunchy_510gm_600x600_a824f0ab-a9dd-4120-8b4c-3ff571aeb645_600x.jpg?v=1732089677",
         title: "vote for your favorite type of peanut butter",
         description: "vote between cruncy and smooth peanut butter",
         label: "Vote",
         links:{
            actions:[
                {
                     label: "Cruncy",
                    href: "/api/vote?candidate=cruncy"
                },
                {
                     label: "Smooth",
                    href: "/api/vote?candidate=smooth"
                },
             ],
         }
    }
    return  Response.json(ActionMetadata, {headers: ACTIONS_CORS_HEADERS});
}


export async function POST(request: Request){

    const url = new URL(request.url);
    const candidate = url.searchParams.get('candidate');
    if(candidate !== "Cruncy" && candidate !== "Smooth"){
        return Response.json({error: "Invalid candidate"}, {status: 400, headers: ACTIONS_CORS_HEADERS});
    }

    const connection = new Connection("http://127.0.0.1:8899/", "confirmed")
    const program: Program<Voting> = new Program<Voting>(IDL, connection);
    const body: ActionPostRequest = await request.json();
    let voter = new PublicKey(body.account);
    try {
        voter = new PublicKey(body.account);
        
    } catch (error) {
        return new Response('Invalid "account" provided', {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
        
    }

    const instruction = await program.methods.vote(candidate, new BN(1))
    .accounts({
        signer: voter,
    })
    .instruction();

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
    })

    
    return Response.json(response, {headers:ACTIONS_CORS_HEADERS});


}
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Voting } from '../target/types/voting'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
const IDL = require('../target/idl/voting.json'); //defining the IDL

const votingAddress = new PublicKey("KFsvLXCXXrm1PuSYGbnqHDcoUt19aX5nh6bAD6pVfK1");

describe('Create a system account', () => {

  test("bankrun", async () => {
    const context = await startAnchor("", [{ name: "voting", programId: votingAddress }], []);
    const provider = new BankrunProvider(context);

    const puppetProgram = new Program<Voting>(
      IDL,
      provider,
    );

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      puppetProgram.programId
    );

    await puppetProgram.methods.initializePoll(
      new anchor.BN(1),
      new anchor.BN(0),
      new anchor.BN(1759508293),
      "test-poll",
      "description",
    ).rpc();

    const pollAccount = await puppetProgram.account.pollAccount.fetch(pollAddress);
    console.log(pollAccount);
  });

});

describe('Initialize candidates', () => {
  it("initialize candidate", async () => {
    const context = await startAnchor("", [{ name: "voting", programId: votingAddress }], []);
    const provider = new BankrunProvider(context);

    const program = new Program<Voting>(
      IDL,
      provider,
    );

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const smoothTx = await program.methods.initializeCandidate(
      new anchor.BN(1),
      "smooth",
    ).accounts({
      pollAccount: pollAddress
    })
    .rpc();

    const crunchyTx = await program.methods.initializeCandidate(
      new anchor.BN(1),
      "crunchy",
    ).accounts({
      pollAccount: pollAddress
    })
    .rpc();

    console.log('Candidates initialized successfully');
  });
});
import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import solanaLogo from './solanaLogo.svg';
import Token_balance from './components/Token_balance';
import BlurText from "./components/BlurText";
import StarBorder from "./components/StarBorder";
import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Connection, 
  Keypair, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Transaction
} from '@solana/web3.js';
import * as token from '@solana/spl-token';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';

const App = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [tokenImage, setTokenImage] = useState('');
  const [mintAddress, setMintAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const TOKEN_PROGRAM_ID = token.TOKEN_PROGRAM_ID;

  const createToken = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    const mintAccount = Keypair.generate();
    const tokenATA = await token.getAssociatedTokenAddress(
      mintAccount.publicKey,
      wallet.publicKey
    );

    try {
      const { blockhash } = await connection.getLatestBlockhash();
      
      const transaction = new Transaction(
        {
          feePayer: wallet.publicKey,
          recentBlockhash: blockhash
        }
      );

      const lamports = await token.getMinimumBalanceForRentExemptMint(connection);
      const createAccountTransaction = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintAccount.publicKey,
        space: token.MINT_SIZE,
        lamports: lamports,
        programId: TOKEN_PROGRAM_ID,
      });
      console.log("output",createAccountTransaction)
      const initializeMintTransaction = token.createInitializeMintInstruction(
        mintAccount.publicKey,
        9,
        wallet.publicKey,
        wallet.publicKey,
        TOKEN_PROGRAM_ID
      );

      const createATATransaction = token.createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        tokenATA,
        wallet.publicKey,
        mintAccount.publicKey,
        TOKEN_PROGRAM_ID,
        token.ASSOCIATED_TOKEN_PROGRAM_ID
      );

      transaction.add(createAccountTransaction);
transaction.add(initializeMintTransaction);
transaction.add(createATATransaction);
     console.log(createATATransaction)
      console.log('Transaction before signing:', transaction);

            //check the problem from here
      const signedTransaction = await wallet.signTransaction(transaction);
      console.log('Signed Transaction:', signedTransaction);
      
      const signers = [wallet, mintAccount];
      console.log(createAccountTransaction);
      console.log(initializeMintTransaction);
      console.log(createATATransaction);
      console.log(signers);
      console.log(signedTransaction);


      const signature = await connection.sendTransaction(signedTransaction, signers, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
    });
      console.log("Signed Transaction:", signature);


      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Transaction confirmed:', signature);

      return mintAccount.publicKey;
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error(`Failed to create token: ${error.message}`);
    }
  };

  const addMetadata = async (mintAddress, metadata) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );

    try {
      const { uri } = await metaplex.nfts().uploadMetadata({
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        image: metadata.image,
      });

      const { nft } = await metaplex.nfts().create({
        uri,
        name: metadata.name,
        sellerFeeBasisPoints: 0,
        mintAddress: new PublicKey(mintAddress),
        symbol: metadata.symbol,
        creators: [{ address: wallet.publicKey, share: 100 }],
        isMutable: true,
      });

      return nft;
    } catch (error) {
      console.error('Error adding metadata:', error);
      throw new Error(`Failed to add metadata: ${error.message}`);
    }
  };

  const mintTokens = async (mintAddress, amount) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      const mintPubkey = new PublicKey(mintAddress);
      const recipientATA = await token.getAssociatedTokenAddress(
        mintPubkey,
        wallet.publicKey
      );

      const { blockhash } = await connection.getLatestBlockhash();
      
      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        recentBlockhash: blockhash
      });

      const mintToInstruction = token.createMintToInstruction(
        mintPubkey,
        recipientATA,
        wallet.publicKey,
        amount * Math.pow(10, 9)
      );

      transaction.add(mintToInstruction);

      const signedTransaction = await wallet.signTransaction(transaction);

      const signature = await connection.sendTransaction(signedTransaction, [], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      await connection.confirmTransaction(signature, 'confirmed');

      return recipientATA;
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw new Error(`Failed to mint tokens: ${error.message}`);
    }
  };

  const handleCreateToken = async () => {
    if (!wallet.connected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!tokenName || !tokenSymbol) {
      setError('Token name and symbol are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const mint = await createToken();
      const mintAddr = mint.toBase58();
      setMintAddress(mintAddr);

      await addMetadata(mintAddr, {
        name: tokenName,
        symbol: tokenSymbol,
        description: tokenDescription,
        image: tokenImage,
      });

      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!wallet.connected || !mintAddress) {
      setError('Please create a token first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await mintTokens(mintAddress, 100);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-dvh w-dvw bg-black overflow-hidden">
      <div className="flex justify-center">
        <img src={solanaLogo} alt="Solana Logo" className="h-10 m-5 pt-2" />
      </div>
      <div className="flex justify-center pt-6">
        <h1 id="heading" className="text-white">
          <BlurText
            text="Solana Token Launcher V2"
            delay={150}
            animateBy="words"
            direction="top"
            className="text-4xl mb-8 font-semibold"
          />
        </h1>
      </div>
      <div className="h-[50%] flex items-center justify-center">
        <StarBorder className="custom-class md:w-[50%] lg:w-[35%]" color="cyan" speed="5s">
          <div>
            <h1 className="text-gray-600 text-2xl pt-2 pb-2">Connect your wallet:</h1>
            <div className="flex justify-between gap-3">
              <WalletModalProvider>
                <WalletMultiButton />
                <WalletDisconnectButton />
              </WalletModalProvider>
            </div>
            <div className="p-2">
              <Token_balance />
            </div>
            <div>
              <h2 className="text-gray-500 text-xl p-2">Create New Token</h2>
              <input
                type="text"
                placeholder="Token Name"
                value={tokenName}
                className="border-2 border-gray-800 rounded-md w-[95%] p-1 m-1"
                onChange={(e) => setTokenName(e.target.value)}
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="Token Symbol"
                value={tokenSymbol}
                className="border-2 border-gray-800 rounded-md w-[95%] p-1 m-1"
                onChange={(e) => setTokenSymbol(e.target.value)}
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={tokenDescription}
                className="border-2 border-gray-800 rounded-md w-[95%] p-1 m-1"
                onChange={(e) => setTokenDescription(e.target.value)}
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={tokenImage}
                className="border-2 border-gray-800 rounded-md w-[95%] p-1 m-1"
                onChange={(e) => setTokenImage(e.target.value)}
                disabled={isLoading}
              />
              {error && <p className="text-red-500 text-sm m-1">{error}</p>}
              <button
                onClick={handleCreateToken}
                className="border-2 border-gray-800 rounded-md p-1 m-1 disabled:opacity-50"
                disabled={isLoading || !wallet.connected}
              >
                {isLoading ? 'Creating...' : 'Create Token'}
              </button>
              {mintAddress && (
                <div className="mt-4">
                  <p className="text-sm break-all">Token Address: {mintAddress}</p>
                  <button
                    onClick={handleMintTokens}
                    className="border-2 border-gray-800 rounded-md p-1 m-1 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Minting...' : 'Mint 100 Tokens'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </StarBorder>
      </div>
    </div>
  );
};

export default App;
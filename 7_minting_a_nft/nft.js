import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import fs from "fs";
import path from "path"; // Import path module for handling file paths

// Initialize Metaplex
const connection = new Connection(clusterApiUrl("devnet")); // Use Solana devnet
console.log("Connecting to", connection);

// Load your Solana CLI wallet keypair
const walletKeypairPath = path.resolve(process.env.HOME, ".config/solana/id.json"); // Use path.resolve for cross-platform compatibility
const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync(walletKeypairPath, "utf-8")))
);

const metaplex = Metaplex.make(connection).use(keypairIdentity(walletKeypair));

// Read the image file
const imageBuffer = fs.readFileSync(path.resolve("./profile.jpg")); // Use path.resolve for cross-platform compatibility
const imgMetaplexFile = {
  buffer: imageBuffer,
  fileName: "profile.jpg",
  contentType: "image/jpeg", // Correct MIME type for JPEG
};

// Upload the image to storage
const imgUri = await metaplex.storage().upload(imgMetaplexFile);
console.log("Image URI:", imgUri);

// Create NFT metadata
const metadata = {
  name: "My NFT Profile",
  description: "This is my first NFT on Solana!",
  image: imgUri, // Use the uploaded image URI
};

// Upload metadata to storage
const metadataUri = await metaplex.storage().upload(metadata);
console.log("Metadata URI:", metadataUri);

// Create the NFT on Solana
const { nft } = await metaplex.nfts().create({
  uri: metadataUri, // Link to the metadata
  name: metadata.name,
  sellerFeeBasisPoints: 500, // 5% royalty
});

console.log("NFT created:", nft);
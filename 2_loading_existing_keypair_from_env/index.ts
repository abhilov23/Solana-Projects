import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
 
const keypair = getKeypairFromEnvironment("SECRET_KEY");
 
console.log(
  `✅ Finished! We've loaded our secret key securely, using an env file!`,
);

console.log(`Public Key: ${keypair.publicKey.toString()}`);

console.log(`Private Key: ${keypair.secretKey.toString()}`);
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

const Token_balance = () => {
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();
   
  useEffect(() => {
    if (!connection || !publicKey) {
      return;
    }

    connection.getAccountInfo(publicKey).then((info) => {
      setBalance(info.lamports);
    });
  }, [connection, publicKey]);


  return (
    <div className="text-white text-2xl flex justify-between ">
        <p>{publicKey ? `SOL Balance:` : ""}</p>
      <p>{publicKey ? ` ${balance / LAMPORTS_PER_SOL}` : ""}</p>
    </div>
  )
}

export default Token_balance
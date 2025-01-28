import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";

import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";



const endpoint = clusterApiUrl("devnet");

function MyApp() {
  const wallets = useMemo(() => [], []);

  return (
    <StrictMode>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <App />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')).render(<MyApp />);
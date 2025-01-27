import {
  WalletDisconnectButton,
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import solanaLogo from './solanaLogo.svg';
import Token_balance from './components/Token_balance';

const TokenAccountPage = () => {
 
  return (
    <> 
    <div className='h-dvh w-dvw bg-[#0e0c0e] overflow-hidden'>
      {/*image div */}
    <div className="flex justify-center">
    <img src={solanaLogo} alt="" className="h-10 m-1 pt-1" />
    </div>
    <div className="flex justify-center pt-6">
    <h1 className="text-white text-4xl font-semibold font-bold">Solana Token  Launcher V2</h1>
    </div>
    {/*2nd core div */}
    <div className="h-full flex items-center justify-center">
      {/*main middle div */}
    <div className="border-2 rounded-2xl p-2 bg-[#1b1622] w-150">
    <h1 className="text-white text-2xl pt-2 pb-2">Let's connect your wallet here:</h1>
    {/*Buttons-section */}
    <div className="flex justify-between gap-3">
      <WalletModalProvider> 
        <WalletMultiButton/>
        <WalletDisconnectButton/>
      </WalletModalProvider>
      </div>
      {/*Balance-section:*/}
      <div className="p-2"> 
       <Token_balance />
       </div>
      


    </div>
    </div>
    </div>
    </>
  );
};

export default TokenAccountPage;
import { useState } from 'react';
import { useAccount } from 'wagmi'
import * as circomlib from 'circomlibjs';
import ZKPassportComponent from '../components/zkPassport/zkPassport';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  createPXEClient,
  AztecAddress,
} from '@aztec/aztec.js';
import { getDeployedTestAccountsWallets } from '@aztec/accounts/testing';
import { ZeroBotContract } from '../../public/artifacts/ZeroBot';
import { PXE_URL } from '../utils/constants';


export default function Home() {
  const [status, setStatus] = useState<"idle" | "getting" | "zkPassport" | "challenge" | "creating" | "finish">("idle")
  const [error, setError] = useState<string | null>(null)
  const { address, isConnected } = useAccount();

  const deployContractFlow = async () => {
    const {contractAddress} = await deployContract();
    await createIdentity(contractAddress);
    await getPrivateIdentity(contractAddress);
  }

  const handleGetIdentity = async () => {
    setStatus("zkPassport");
  };

  const deployContract = async () => {
    try {
      const pxe = createPXEClient(PXE_URL);
      const [wallet] = await getDeployedTestAccountsWallets(pxe);
  
      const deployedContract = await ZeroBotContract.deploy(wallet)
      .send()
      .deployed();
      console.log(deployedContract)
  
      const contractAddress = deployedContract.address.toString();
      console.log(`✅ Identity Contract deployed at ${contractAddress}`);
  
      return { contractAddress };
    } catch (error) {
      console.log("ERROR DEPLOYING CONTRACT", error.message)
    }
  }

  const createIdentity = async (contract: string) => {
      const pxe = createPXEClient(PXE_URL);
      const [wallet1, wallet2] = await getDeployedTestAccountsWallets(pxe);
  
      const zeroBot = await ZeroBotContract.at(AztecAddress.fromString(contract), wallet1);
      const tx = zeroBot.methods
        .create_identity(BigInt(2), BigInt(2), BigInt(2), BigInt(2), BigInt(2))
        .send();
  
      const txHash = await tx.getTxHash();
      console.log(`🚀 Create Identity TX sent: ${txHash.toString()}`);
      await tx.wait();
      console.log('✅ Create Identity confirmed!');
  
      return { txHash: txHash.toString() };
  }

  const getPrivateIdentity = async (contract: string) => {
    const pxe = createPXEClient(PXE_URL);
    const [wallet] = await getDeployedTestAccountsWallets(pxe);
    const zeroBot = await ZeroBotContract.at(AztecAddress.fromString(contract), wallet);

    const result = await zeroBot.methods.get_identity(BigInt(2)).simulate({});
    
    console.log(result);
  }
  

  return (
    <div className="flex flex-1 flex-col justify-center items-center w-full bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 pt-10">ZeroBot</h1>
        <p className="text-gray-600 text-base">
          A ZK-based reCAPTCHA: privately prove you're not a bot to join a Discord channel
        </p>
        {status === "zkPassport" && (
          <div className="mt-6">
            <ZKPassportComponent 
              onClose={() => setStatus("idle")}
            />
          </div>
        )}
        <div className="flex justify-center items-center">
        {!isConnected ? <ConnectButton showBalance={false} /> :
          <button
            onClick={handleGetIdentity}
            disabled={(status !== "idle" && status !== "finish") || !address}
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-6 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status !== 'idle' && status !== 'finish' && (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {{
              idle: 'Get identity',
              getting: 'Fetching identity...',
              challenge: 'Verifying account ownership...',
              zkPassport: 'Verifying zkPassport...',
              creating: 'Creating identity...',
              finish: 'Done!'
            }[status]}
          </button>
          }
        </div>
        {error && (
          <div className="mt-4 text-red-600 text-sm bg-red-100 p-2 rounded-md border border-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useAccount } from 'wagmi'
import * as circomlib from 'circomlibjs';
import ZKPassportComponent from '../components/zkPassport/zkPassport';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  createPXEClient,
  AztecAddress,
  SponsoredFeePaymentMethod,
  EthAddress,
  getContractInstanceFromDeployParams
} from '@aztec/aztec.js';

import {
  Transaction, keccak256, toBeArray, Signature, getBytes, SigningKey, toUtf8Bytes, toBeHex  , zeroPadValue
} from 'ethers'
import { getDeployedTestAccountsWallets } from '@aztec/accounts/testing';
import { ZeroBotContract, ZeroBotContractArtifact } from '../../artifacts/ZeroBot';
import { setupPXE } from '../utils/setupPXE';
import { useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { getDeployerWalletFromEnv, getInstance, poseidonHash } from '../utils/utils';
import internalApi from '../api/axios';
import { contractAddress } from '../utils/utils';
import ProofGeneration from '../components/ProofGeneration';
import { getSponsoredFPCInstance } from "../utils/sponsored_fpc.js";
import { SponsoredFPCContract } from "@aztec/noir-contracts.js/SponsoredFPC";

export default function Home({ onClose }: { onClose?: () => void }) {
  const [status, setStatus] = useState<"idle" | "getting" | "zkPassport" | "challenge" | "creating" | "finish">("idle")
  const [error, setError] = useState<string | null>(null)
  const [contract, setContract] = useState<string | null>(null)
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient()

  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get('userId');
  const guildId = queryParams.get('guildId');

  const handleGetIdentity = async () => {
   try {
      setContract(contractAddress);
      setStatus("zkPassport");
    } catch (err: any) {
      console.log("ERROR DEPLOYING CONTRACT", err.message)
    }
  };

  const sendPostRequest = async () => {
    const response = await internalApi.post('/api/status', {
      userId,
      guildId
    })

    console.log(response)
  }

  /*
  const deployContract = async () => {
      const pxe = createPXEClient(PXE_URL);
      await pxe.registerContractClass(ZeroBotContractArtifact);
      const [wallet] = await getDeployedTestAccountsWallets(pxe);
      const tx = ZeroBotContract.deploy(wallet, wallet.getAddress()).send();
      await tx.wait();
      const deployed = await tx.deployed();
      await pxe.registerContract({
        instance: deployed.instance,
        artifact: ZeroBotContractArtifact
      });

      const contractAddress = deployed.address.toString();
      console.log(`✅ Identity Contract deployed at ${contractAddress}`);

      return { contractAddress };
 
  }*/

  const createIdentity = async (contract: string, passportData: any) => {
    const pxe = await setupPXE();
    const sponsoredFPC = await getSponsoredFPCInstance();
    await pxe.registerContract({ instance: sponsoredFPC, artifact: SponsoredFPCContract.artifact });
    const sponsoredPaymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);
    const wallet = await getDeployerWalletFromEnv(pxe);

    const instance = await getInstance();

    await pxe.registerContract({ 
      instance, 
      artifact: ZeroBotContractArtifact,
      contractAddress: AztecAddress.fromString(contract),
    });

    const zeroBot = await ZeroBotContract.at(AztecAddress.fromString(contract), wallet);
    const { userSignature, userPubKeyX, userPubKeyY, userDigest } = await parseUserChallenge();
    const tx = zeroBot.methods
      .create_identity(
        passportData.firstname, 
        passportData.lastname,
        passportData.documentType,
        passportData.documentNumber,
        userPubKeyX,
        userPubKeyY,
        userSignature,
        userDigest
      )
      .send();

    await tx.getTxHash();
    await tx.wait();

    return { userSignature, userPubKeyX, userPubKeyY, userDigest };
  }


  const parseUserChallenge = async () => {
    if (!walletClient) throw new Error('No wallet client');

    const provider = new BrowserProvider(walletClient.transport);
    const signer = await provider.getSigner();
    const nonce = uuidv4();
    const timestamp = Date.now().toString();

    const poseidon = await circomlib.buildPoseidon();
    const {hash, value1Hash, value2Hash} = await poseidonHash(nonce, timestamp);

    const nonceBigInt = poseidon.F.toObject(value1Hash).toString();
    const timestampBigInt = poseidon.F.toObject(value2Hash).toString();
    const hashBigInt = poseidon.F.toObject(hash);
    const digest = zeroPadValue(toBeHex(hashBigInt), 32);
    const signerAddress = await signer.getAddress();
    const sig = await walletClient.signMessage({
      account: signerAddress as `0x${string}`,
      message: { raw: digest as `0x${string}` }
    });

    const signature = Signature.from(sig);
    const rBytes = getBytes(signature.r);
    const sBytes = getBytes(signature.s);
    const userSignature = [...rBytes, ...sBytes];

    const prefix = "\x19Ethereum Signed Message:\n32";
    const digestBytes = getBytes(digest);
    const prefixedMessage = keccak256(
      new Uint8Array([
        ...toUtf8Bytes(prefix),
        ...digestBytes
      ])
    );

    const pubKeyHex = SigningKey.recoverPublicKey(prefixedMessage, sig);
    const pubKeyBytes = getBytes(pubKeyHex);
    const userPubKeyX = Array.from(pubKeyBytes.slice(1, 33));
    const userPubKeyY = Array.from(pubKeyBytes.slice(33, 65));

    const userDigest = Array.from(getBytes(prefixedMessage));
    return { userSignature, userPubKeyX, userPubKeyY, userDigest };
  };

  const getPrivateIdentity = async (contract: string, user: any) => {
    const { userSignature, userPubKeyX, userPubKeyY, userDigest } = user;
    const pxe = setupPXE();
    const wallet = await getDeployerWalletFromEnv(pxe);
    const zeroBot = await ZeroBotContract.at(AztecAddress.fromString(contract), wallet);

    const result = await zeroBot.methods.get_identity(
      userPubKeyX,
      userPubKeyY,
      userSignature,
      userDigest
    ).simulate({});
    
    console.log(result);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-lg mx-auto p-0">
        {status === "zkPassport" ? (
          <ZKPassportComponent
            contractAddress={contract}
            createIdentity={createIdentity}
            getPrivateIdentity={() => {}}
            onClose={() => setStatus("idle")}
          />
        ) : (
          <div className="futuristic-card neon-shadow p-8 pt-6 flex flex-col items-center">
          {onClose && (
            <button
              className="absolute top-4 right-4 text-purple-200 hover:text-white text-xl font-bold bg-transparent border-none outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          )}
          <img src="favicon.png" className="h-18 w-18" />
            <p className="text-purple-200/90 text-center font-medium mb-4">
              Privately prove you're not a bot to join the Discord server
            </p>
            <ProofGeneration />
            <div className="w-full flex flex-col items-center">
              {!isConnected ? (
                <div className="glass-effect p-4 rounded-xl border border-purple-500/30 w-full">
                  <p className="text-purple-200/80 mb-2 font-medium text-center">Connect your wallet to get started</p>
                  <ConnectButton showBalance={false} />
                </div>
              ) : (
                <button
                  onClick={handleGetIdentity}
                  disabled={(status !== "idle" && status !== "finish") || !address}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl text-base transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg border border-purple-400/30 mt-2"
                >
                  {status !== 'idle' && status !== 'finish' && (
                    <div className="loading-spinner" />
                  )}
                  <span className="font-semibold">
                    {{
                      idle: 'Get Identity',
                      getting: 'Fetching identity...',
                      challenge: 'Verifying account ownership...',
                      zkPassport: 'Verifying zkPassport...',
                      creating: 'Creating identity...',
                      finish: 'Done!'
                    }[status]}
                  </span>
                </button>
              )}
            </div>
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl backdrop-blur-sm w-full text-center">
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
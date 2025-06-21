import { useState } from 'react';
import { useAccount } from 'wagmi'
import * as circomlib from 'circomlibjs';
import ZKPassportComponent from '../components/zkPassport/zkPassport';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  createPXEClient,
  AztecAddress,
} from '@aztec/aztec.js';

import {
  Transaction, keccak256, toBeArray, Signature, getBytes, SigningKey, toUtf8Bytes, toBeHex  , zeroPadValue
} from 'ethers'
import { getDeployedTestAccountsWallets } from '@aztec/accounts/testing';
import { ZeroBotContract, ZeroBotContractArtifact } from '../../artifacts/ZeroBot';
import { PXE_URL } from '../utils/constants';
import { useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { poseidonHash } from '../utils/utils';

export default function Home() {
  const [status, setStatus] = useState<"idle" | "getting" | "zkPassport" | "challenge" | "creating" | "finish">("idle")
  const [error, setError] = useState<string | null>(null)
  const [contract, setContract] = useState<string | null>(null)
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient()

  const handleGetIdentity = async () => {
   try {
      const {contractAddress} = await deployContract();
      setContract(contractAddress);
      setStatus("zkPassport");
    } catch (err: any) {
      console.log("ERROR DEPLOYING CONTRACT", err.message)
    }
  };
  
  
  const deployContract = async () => {
      const pxe = createPXEClient(PXE_URL);
      await pxe.registerContractClass(ZeroBotContractArtifact);
      const [wallet] = await getDeployedTestAccountsWallets(pxe);
      const tx = ZeroBotContract.deploy(wallet).send();
      await tx.wait();
      const deployed = await tx.deployed();
      await pxe.registerContract({
        instance: deployed.instance,
        artifact: ZeroBotContractArtifact
      });

      const contractAddress = deployed.address.toString();
      console.log(`✅ Identity Contract deployed at ${contractAddress}`);

      return { contractAddress };
 
  }

  const createIdentity = async (contract: string, passportData: any) => {
      const pxe = createPXEClient(PXE_URL);
      const [wallet1] = await getDeployedTestAccountsWallets(pxe);
  
      const zeroBot = await ZeroBotContract.at(AztecAddress.fromString(contract), wallet1);
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
  
      const txHash = await tx.getTxHash();
      console.log(`🚀 Create Identity TX sent: ${txHash.toString()}`);
      await tx.wait();
      console.log('✅ Create Identity confirmed!');
  
      return { txHash: txHash.toString() };
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

  const getPrivateIdentity = async (contract: string) => {
    const pxe = createPXEClient(PXE_URL);
    const [wallet] = await getDeployedTestAccountsWallets(pxe);
    const zeroBot = await ZeroBotContract.at(AztecAddress.fromString(contract), wallet);

    const result = await zeroBot.methods.get_identity(
      
    ).simulate({});
    
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
              contractAddress={contract}
              createIdentity={createIdentity}
              getPrivateIdentity={getPrivateIdentity}
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
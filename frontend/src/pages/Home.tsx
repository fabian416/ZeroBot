import { useEffect, useState } from 'react';
import {
  Transaction, keccak256, Signature, getBytes, SigningKey,
} from 'ethers'
import { v4 as uuidv4 } from 'uuid'
import { useWalletClient } from 'wagmi'
import { BrowserProvider } from 'ethers'
import { useAccount } from 'wagmi'
import * as circomlib from 'circomlibjs';

export default function Home() {
  const [status, setStatus] = useState<"idle" | "getting" | "challenge" | "creating" | "finish">("idle")
  const [error, setError] = useState<string | null>(null)
  const { address } = useAccount();

  const handleGetIdentity = () => {};

  return (
    <div className="flex flex-1 flex-col justify-center items-center w-full bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 pt-10">ZeroBot</h1>
        <p className="text-gray-600 text-base">
          A ZK-based reCAPTCHA: privately prove you're not a bot to join a Discord channel
        </p>
        <div className="flex justify-center items-center">
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
              creating: 'Creating identity...',
              finish: 'Done!'
            }[status]}
          </button>
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
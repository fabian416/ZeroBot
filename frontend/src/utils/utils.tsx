
import * as circomlib from 'circomlibjs';
import { AztecAddress, Fq, Fr, Salt, EthAddress, getContractInstanceFromDeployParams } from '@aztec/aztec.js';
import { getSchnorrWalletWithSecretKey } from '@aztec/accounts/schnorr';
import { deriveSigningKey } from '@aztec/stdlib/keys';
import { ZeroBotContractArtifact } from '../../artifacts/ZeroBot';

export const poseidonHash = async (value1: string, value2: any) => {
    if (!value1 || value2 === undefined || value2 === null) {
      throw new Error("poseidonHash recibió un value1 o value2 vacío");
    }
  
    const poseidon = await circomlib.buildPoseidon();
  
    const value1BigInt = BigInt('0x' + Buffer.from(value1).toString('hex'));
  
    let value2BigInt: bigint;
    if (typeof value2 === 'number' || typeof value2 === 'bigint') {
        value2BigInt = BigInt(value2);
    } else if (typeof value2 === 'string') {
        try {
            value2BigInt = BigInt(value2);
        } catch {
            value2BigInt = BigInt('0x' + Buffer.from(value2).toString('hex'));
        }
    } else {
        throw new Error('Tipo de value2 no soportado');
    }

    const value1Hash = poseidon([value1BigInt]);
    const value2Hash = poseidon([value2BigInt]);

    const hash = poseidon([value1Hash, value2Hash]);
    return {hash, value1Hash, value2Hash};
};


export async function getDeployerWalletFromEnv(pxe: any) {
    //const admin = import.meta.env.VITE_PUBLIC_WALLET_ADDRESS;
    const secret = import.meta.env.VITE_PUBLIC_WALLET_SECRET;
    const salt = import.meta.env.VITE_PUBLIC_WALLET_SALT;
    if (!secret || !salt) {
        throw new Error("SECRET or SALT not set in .env file.");
    }

    const secretKey = Fr.fromString(secret); 
    const saltKey = Fr.fromString(salt);
    //const adminAddress = AztecAddress.fromString(admin);
    //console.log(adminAddress);
    const signingKey = deriveSigningKey(secretKey);

    const wallet = await getSchnorrWalletWithSecretKey(pxe, secretKey, signingKey, saltKey);
    const address = wallet.getAddress().toString();
    console.log(address);
    return wallet;
}

export const getInstance = async () => {
    const admin = import.meta.env.VITE_PUBLIC_WALLET_ADDRESS;
    const salt = import.meta.env.VITE_PUBLIC_WALLET_SALT;
    const instance = getContractInstanceFromDeployParams(
        ZeroBotContractArtifact, {
        deployer: AztecAddress.fromString(admin),
        constructorArgs: [AztecAddress.fromString(admin)],
        salt: Fr.fromString(salt),
        }
    );
    return instance;
}

export const contractAddress = import.meta.env.VITE_PUBLIC_CONTRACT_ADDRESS!;

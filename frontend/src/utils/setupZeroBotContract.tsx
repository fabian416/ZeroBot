
import {
  AztecAddress,
  SponsoredFeePaymentMethod,
} from '@aztec/aztec.js';

import { ZeroBotContract, ZeroBotContractArtifact } from '../../artifacts/ZeroBot';
import { setupPXE } from '../utils/setupPXE';
import { getDeployerWalletFromEnv, getInstance } from '../utils/utils';
import { getSponsoredFPCInstance } from "../utils/sponsored_fpc.js";
import { SponsoredFPCContract } from "@aztec/noir-contracts.js/SponsoredFPC";

export const setupZeroBotContract = async (contract: string) => {
    const pxe = await setupPXE();
    const sponsoredFPC = await getSponsoredFPCInstance();
    await pxe.registerContract({ instance: sponsoredFPC, artifact: SponsoredFPCContract.artifact });
    const sponsoredPaymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);
    const wallet = await getDeployerWalletFromEnv(pxe);

    const instance = await getInstance();
    await pxe.registerContract({ 
      instance, 
      artifact: ZeroBotContractArtifact,
    });

    const zeroBot = await ZeroBotContract.at(AztecAddress.fromString(contract), wallet);
    return { zeroBot, sponsoredPaymentMethod };
}
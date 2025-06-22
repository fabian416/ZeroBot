import { createPXEService, getPXEServiceConfig } from '@aztec/pxe/client/lazy';
import { createAztecNodeClient, createLogger, waitForPXE,  } from '@aztec/aztec.js';

export const setupPXE = async () => {
    // Usa un nodo público de testnet para conectarte
    const { NODE_URL = 'https://aztec-alpha-testnet-fullnode.zkv.xyz' } = process.env;
    
    const node = createAztecNodeClient(NODE_URL);

    const l1Contracts = await node.getL1ContractAddresses();

    const config = getPXEServiceConfig();
    const fullConfig = { ...config, l1Contracts };
    fullConfig.proverEnabled = true; 

    const pxe = await createPXEService(node, {} as any); 

    await waitForPXE(pxe);
    return pxe;
}

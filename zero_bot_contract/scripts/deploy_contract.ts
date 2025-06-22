import { ZeroBotContract } from "../src/artifacts/ZeroBot.js"
import { createLogger, PXE, Logger, SponsoredFeePaymentMethod, Fr } from "@aztec/aztec.js";
import { TokenContract } from "@aztec/noir-contracts.js/Token"
import { setupPXE } from "../src/utils/setup_pxe.js";
import { getSponsoredFPCInstance } from "../src/utils/sponsored_fpc.js";
import { SponsoredFPCContract } from "@aztec/noir-contracts.js/SponsoredFPC";
import { deploySchnorrAccount } from "../src/utils/deploy_account.js";

async function main() {
    let pxe: PXE;
    let logger: Logger;

    logger = createLogger('aztec:aztec-starter');
    logger.info('🚀 Starting contract deployment process...');

    // Setup PXE
    logger.info('📡 Setting up PXE connection...');
    pxe = await setupPXE();
    const nodeInfo = await pxe.getNodeInfo();
    logger.info(`📊 Node info: ${JSON.stringify(nodeInfo, null, 2)}`);

    // Setup sponsored FPC
    logger.info('💰 Setting up sponsored fee payment contract...');
    const sponsoredFPC = await getSponsoredFPCInstance();
    logger.info(`💰 Sponsored FPC instance obtained at: ${sponsoredFPC.address}`);
    
    logger.info('📝 Registering sponsored FPC contract with PXE...');
    await pxe.registerContract({ instance: sponsoredFPC, artifact: SponsoredFPCContract.artifact });
    const sponsoredPaymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);
    logger.info('✅ Sponsored fee payment method configured');

    // Deploy account
    logger.info('👤 Deploying Schnorr account...');
    let accountManager = await deploySchnorrAccount(pxe);
    const wallet = await accountManager.getWallet();
    const address = await accountManager.getAddress();
    logger.info(`✅ Account deployed successfully at: ${address}`);

    // Deploy identity contract
    logger.info('🗳️  Starting Zero Bot contract deployment...');
    logger.info(`📋 Admin address for identity contract: ${address}`);
    
    const deployTx = ZeroBotContract.deploy(wallet, address).send({
        fee: { paymentMethod: sponsoredPaymentMethod }
      });
    
    logger.info('⏳ Waiting for deployment transaction to be mined...');
    const identityContract = await deployTx.deployed({ timeout: 120000 });
    
    logger.info(`🎉 Zero Bot contract deployed successfully!`);
    logger.info(`📍 Contract address: ${identityContract.address}`);
    logger.info(`👤 Admin address: ${address}`);
    
    // Verify deployment
    logger.info('🔍 Verifying contract deployment...');
    logger.info('🔍 Verifying contract deployment...');
    try {
    logger.info('🧪 Reading authorized address...');
    const authorized = await identityContract.methods.get_authorized().simulate();
    logger.info(`✅ Authorized address: ${authorized.toString()}`);
    } catch (error) {
    logger.error(`❌ Contract verification failed: ${error}`);
    }
        
    logger.info('🏁 Deployment process completed successfully!');
    logger.info(`📋 Summary:`);
    logger.info(`   - Contract Address: ${identityContract.address}`);
    logger.info(`   - Admin Address: ${address}`);
    logger.info(`   - Sponsored FPC: ${sponsoredFPC.address}`);
}

main().catch((error) => {
    const logger = createLogger('aztec:aztec-starter');
    logger.error(`❌ Deployment failed: ${error.message}`);
    logger.error(`📋 Error details: ${error.stack}`);
    process.exit(1);
});
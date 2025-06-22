import { SponsoredFeePaymentMethod, Fr, AztecAddress } from "@aztec/aztec.js";
import { SponsoredFPCContract } from "@aztec/noir-contracts.js/SponsoredFPC";
import { setupPXE } from "../utils/setup_pxe.js";
import { getSponsoredFPCInstance } from "../utils/sponsored_fpc.js";
import { deploySchnorrAccount } from "../utils/deploy_account.js";
import { getAccountFromEnv } from "../utils/create_account_from_env.js";
import { ZeroBotContract } from "../utils/ZeroBot.js";

class NoirService {
    async deployZeroBot() {
        let pxe;
    
        console.log('🚀 Starting contract deployment process...');
    
        // Setup PXE
        console.log('📡 Setting up PXE connection...');
        pxe = await setupPXE();
        const nodeInfo = await pxe.getNodeInfo();
        console.log(`📊 Node info: ${JSON.stringify(nodeInfo, null, 2)}`);
    
        // Setup sponsored FPC
        console.log('💰 Setting up sponsored fee payment contract...');
        const sponsoredFPC = await getSponsoredFPCInstance();
        console.log(`💰 Sponsored FPC instance obtained at: ${sponsoredFPC.address}`);
        
        console.log('📝 Registering sponsored FPC contract with PXE...');
        await pxe.registerContract({ instance: sponsoredFPC, artifact: SponsoredFPCContract.artifact });
        const sponsoredPaymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);
        console.log('✅ Sponsored fee payment method configured');
    
        // Deploy account
        console.log('👤 Deploying Schnorr account...');
        let accountManager = await deploySchnorrAccount(pxe);
        const wallet = await accountManager.getWallet();
        const address = await accountManager.getAddress();
        console.log(`✅ Account deployed successfully at: ${address}`);
    
        // Deploy voting contract
        console.log('🗳️  Starting voting contract deployment...');
        console.log(`📋 Admin address for voting contract: ${address}`);
        
        const deployTx = ZeroBotContract.deploy(wallet, address).send({ 
            fee: { paymentMethod: sponsoredPaymentMethod } 
        });
        
        console.log('⏳ Waiting for deployment transaction to be mined...');
        const zeroBotContract = await deployTx.deployed({ timeout: 120000 });
        
        console.log(`🎉 Voting Contract deployed successfully!`);
        console.log(`📍 Contract address: ${zeroBotContract.address}`);
        console.log(`👤 Admin address: ${address}`);
        
        // Verify deployment
        console.log('🔍 Verifying contract deployment...');
        try {
            // Test a read operation
            console.log('🧪 Testing contract read operation...');
            const authorized = await zeroBotContract.methods.get_authorized().simulate();
            console.log(`👤 Authorized address is: ${authorized.toString()}`);
            
        } catch (error) {
            console.log(`❌ Contract verification failed: ${error}`);
        }

        console.log('🏁 Deployment process completed successfully!');
        console.log(`📋 Summary:`);
        console.log(`   - Contract Address: ${zeroBotContract.address}`);
        console.log(`   - Admin Address: ${address}`);
        console.log(`   - Sponsored FPC: ${sponsoredFPC.address}`);
    }

    async deployIdentity() {

        const pxe = await setupPXE();

        // Setup Sponsored FPC
        const sponsoredFPC = await getSponsoredFPCInstance();
        await pxe.registerContract({ instance: sponsoredFPC, artifact: SponsoredFPCContract.artifact });
        const sponsoredPaymentMethod = new SponsoredFeePaymentMethod(sponsoredFPC.address);

        // Setup account
        const accountManager = await getAccountFromEnv(pxe);
        const wallet = await accountManager.getWallet();

        // Obtener dirección del contrato desde .env
        const contractAddress = process.env.ZERO_BOT_CONTRACT_ADDRESS;
        if (!contractAddress) {
            console.log("❌ ZERO_BOT_CONTRACT_ADDRESS not set in .env");
            return;
        }

        console.log(`🔗 Connecting to ZeroBot at ${contractAddress}...`);
        const zeroBot = await ZeroBotContract.at(AztecAddress.fromString(contractAddress), wallet);

        const authorized = await zeroBot.methods.get_authorized().simulate();
        console.log(`🛂 Authorized address in contract: ${authorized}`);
        // Mock inputs
        const name = Fr.fromString("1234"); // puede ser hash del nombre
        const last_name = Fr.fromString("5678");
        const document_type = Fr.fromString("1"); // por ej: DNI
        const document_number = Fr.fromString("12345678");

        // Firma ECDSA ficticia (mock)
        const pub_key_x = Array.from(new Uint8Array(32).fill(1));
        const pub_key_y = Array.from(new Uint8Array(32).fill(2));
        const signature = Array.from(new Uint8Array(64).fill(3));
        const signed_message_hash = Array.from(new Uint8Array(32).fill(4));

        console.log(`🛠️ Creating identity...`);
        await zeroBot.methods.create_identity(
            name, last_name, document_type, document_number,
            pub_key_x, pub_key_y, signature, signed_message_hash
        ).send({ fee: { paymentMethod: sponsoredPaymentMethod } })
        .wait({ timeout: 120_000 });

        console.log("✅ Identity creation transaction sent and mined.");
        }
}

export default NoirService;
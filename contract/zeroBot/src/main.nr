use dep::aztec::macros::aztec;
use dep::aztec::{
    macros::{functions::{initializer, public}, storage::storage},
    prelude::{AztecAddress, Address, PublicImmutable, Map}
};
use dep::ecrecover::ecrecover;

global ETH_PREFIX_BYTES: [u8; 28] = [
    25, 69, 116, 104, 101, 114, 101, 117, 109, 32, 83, 105, 103, 110, 101, 100, 32, 77, 101, 115,
    115, 97, 103, 101, 58, 10, 51, 50,
];

// Unconstrained function to compute the hash that the user signs.
// This combines nonce and timestamp with Poseidon, adds the Ethereum prefix, and hashes with Keccak.
unconstrained fn compute_user_hash(nonce_hash: Field, timestamp_hash: Field) -> [u8; 32] {
    let combined_hash = poseidon::bn254::hash_2([nonce_hash, timestamp_hash]);
    let message = concat_prefix_and_digest(ETH_PREFIX_BYTES, combined_hash.to_be_bytes());
    keccak256(message, 60)
}

pub fn concat_prefix_and_digest(prefix: [u8; 28], digest: [u8; 32]) -> [u8; 60] {
    let mut out: [u8; 60] = [0; 60];
    for i in 0..28 {
        out[i] = prefix[i];
    }
    for i in 0..32 {
        out[28 + i] = digest[i];
    }
    out
}

#[aztec]
pub contract ZeroBot {
    #[storage]
    struct Identity<Context> {
        hash: Field,
        name: Field,
        last_name: Field,
        document_type: Field,
        document_number: Field,
    }

    #[storage]
    struct Storage<Context> {
        // The symbol of the NFT
        identity: Map<Address, PrivateSet<Identity, Context>>,
    }

    #[public]
    #[initializer]
    fn constructor() {
        // Nothing to initialize yet
    }
    // Create a new identity
    #[private]
    fn create_identity(
        user_pub_key_x: [u8; 32],
        user_pub_key_y: [u8; 32],
        user_signature: [u8; 64],
        nonce_hash: Field,
        timestamp_hash: Field,
        name: Field,
        last_name: Field,
        document_type: Field,
        document_number: Field,
    ) {
        let signed_user_hash = unsafe { compute_user_hash(nonce_hash, timestamp_hash) };

        // Recover the user's Ethereum address from their public key and signature over their identity hash.
        // This shows that the user claims ownership of a particular address (e.g., for KYC or eligibility proofs).
        let user_addr = ecrecover(
            user_pub_key_x,
            user_pub_key_y,
            user_signature,
            signed_user_hash,
        );

        assert(!storage.identity.at(user_addr).is_initialized(), "Identity already registered");
        storage.identity.at(user_addr).write(Identity {
            name,
            last_name,
            document_type,
            document_number
        });
    }
    // Retrieve the Identity
    #[public]
    fn get_identity(identity_hash: Field) -> AztecAddress {
        return storage.identities.at(identity_hash).read();
    }
    // // Check if an identity is registered
    #[public]
    fn is_human(identity_hash: Field) -> bool {
        return storage.identities.at(identity_hash).is_initialized();
    }
}
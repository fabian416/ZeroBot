mod identity_field_note;
use dep::aztec::macros::aztec;
global ETH_PREFIX_BYTES: [u8; 28] = [
    25, 69, 116, 104, 101, 114, 101, 117, 109, 32, 83, 105, 103, 110, 101, 100, 32, 77, 101, 115,
    115, 97, 103, 101, 58, 10, 51, 50,
];


#[aztec]
pub contract ZeroBot {
    use crate::identity_field_note::IdentityFieldNote;
    use dep::aztec::{
        macros::{functions::{initializer, public, private}, storage::storage},
        prelude::{AztecAddress, PublicImmutable, Map, PrivateSet},
    };

    #[storage]
    struct Storage<Context> {
        hash: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
        name: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
        last_name: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
        document_type: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
        document_number: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
    }

    #[public]
    #[initializer]
    fn constructor() {
        // Nothing to initialize yet
    }
    
    // Create a new identity
    #[private]
    fn create_identity(
        ethAddress: Field,
        hash: Field,
        name: Field,
        last_name: Field,
        document_type: Field,
        document_number: Field,
    ) {
        storage.hash.at(ethAddress).add(IdentityFieldNote::new(hash, context.msg_sender()));
        storage.name.at(ethAddress).add(IdentityFieldNote::new(name, context.msg_sender()));
        storage.last_name.at(ethAddress).add(IdentityFieldNote::new(last_name, context.msg_sender()));
        storage.document_type.at(ethAddress).add(IdentityFieldNote::new(document_type, context.msg_sender()));
        storage.document_number.at(ethAddress).add(IdentityFieldNote::new(document_number, context.msg_sender()));

    }
    /*
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
    */
}
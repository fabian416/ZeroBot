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
        macros::{functions::{initializer, public}, storage::storage},
        prelude::{AztecAddress, PublicImmutable, Map, PrivateSet},
    };
    use poseidon::poseidon2;

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
        // let user_addr = ecrecover(
        //     user_pub_key_x,
        //     user_pub_key_y,
        //     user_signature,
        //     signed_user_hash,
        // );

        let hash = poseidon2::Poseidon2::hash([document_number], 1);

        assert(!storage.identity.at(user_addr).is_initialized(), "Identity already registered");
        storage.identity.at(user_addr).write(Identity {
            hash,
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
    // Compute the user hash from nonce and timestamp
    #[private]
    fn compute_identity_hash(
        name: Field,
        last_name: Field,
        document_type: Field,
        document_number: Field,
    ) -> Field {
        poseidon2::Poseidon2::hash([name, last_name, document_type, document_number], 4)
    }
}
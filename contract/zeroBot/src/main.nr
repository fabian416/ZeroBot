use dep::aztec::macros::aztec;
use dep::aztec::{
    macros::{functions::{initializer, public}, storage::storage},
    prelude::{AztecAddress, PublicImmutable, Map}
};

#[aztec]
pub contract ZkIdentityRegistry {

    #[storage]
    struct Storage<Context> {
        // Identity registry mapping identity hashes to Aztec addresses
        identities: Map<Field, PublicImmutable<AztecAddress, Context>, Context>,
    }

    #[public]
    #[initializer]
    fn constructor() {
        // Nothing to initialize yet
    }
    // Create a new identity
    #[public]
    fn create_identity(identity_hash: Field) {
        assert(!storage.identities.at(identity_hash).is_initialized(), "Identity already registered");
        storage.identities.at(identity_hash).initialize(context.msg_sender());
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
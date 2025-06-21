mod identity_field_note;
use dep::aztec::macros::aztec;
global ETH_PREFIX_BYTES: [u8; 28] = [
    25, 69, 116, 104, 101, 114, 101, 117, 109, 32, 83, 105, 103, 110, 101, 100, 32, 77, 101, 115,
    115, 97, 103, 101, 58, 10, 51, 50,
];

global FIELD_HASH: u32 = 0;
global FIELD_NAME: u32 = 1;
global FIELD_LAST_NAME: u32 = 2;
global FIELD_DOCUMENT_TYPE: u32 = 3;
global FIELD_DOCUMENT_NUMBER: u32 = 4;

#[aztec]
pub contract ZeroBot {
    use crate::identity_field_note::IdentityFieldNote;
    use dep::aztec::{
        macros::{functions::{initializer, public, private}, storage::storage},
        prelude::{AztecAddress, PublicImmutable, Map, PrivateSet},
    };
    use dep::aztec::messages::logs::note::encode_and_encrypt_note;

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
        ethAddress: Field,
        name: Field,
        last_name: Field,
        document_type: Field,
        document_number: Field,
    ) {
      
        // Recover the user's Ethereum address from their public key and signature over their identity hash.
        // This shows that the user claims ownership of a particular address (e.g., for KYC or eligibility proofs).
        // let user_addr = ecrecover(
        //     user_pub_key_x,
        //     user_pub_key_y,
        //     user_signature,
        //     signed_user_hash,
        // );

        let hash = poseidon2::Poseidon2::hash([document_number], 1);
  /*
        assert(!storage.hash.at(ethAddress).is_initialized(), "Identity already registered");
      
        storage.hash.at(ethAddress).add(IdentityFieldNote::new(hash, context.msg_sender()));
        storage.name.at(ethAddress).add(IdentityFieldNote::new(name, context.msg_sender()));
        storage.last_name.at(ethAddress).add(IdentityFieldNote::new(last_name, context.msg_sender()));
        storage.document_type.at(ethAddress).add(IdentityFieldNote::new(document_type, context.msg_sender()));
        storage.document_number.at(ethAddress).add(IdentityFieldNote::new(document_number, context.msg_sender()));
*/
    }

    #[private]
    fn write_field(field_selector: u8, key: Field, value: Field) {
        let owner = context.msg_sender();
        let note = IdentityFieldNote::new(value, owner);

        match field_selector {
            FIELD_HASH => storage.hash.at(key).insert(note).emit(encode_and_encrypt_note(&mut context, owner, owner)),
            FIELD_NAME => storage.name.at(key).insert(note).emit(encode_and_encrypt_note(&mut context, owner, owner)),
            FIELD_LAST_NAME => storage.last_name.at(key).insert(note).emit(encode_and_encrypt_note(&mut context, owner, owner)),
            FIELD_DOCUMENT_TYPE => storage.document_type.at(key).insert(note).emit(encode_and_encrypt_note(&mut context, owner, owner)),
            FIELD_DOCUMENT_NUMBER => storage.document_number.at(key).insert(note).emit(encode_and_encrypt_note(&mut context, owner, owner)),
            _ => assert(false, "Field selector not recognized"),
        }
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
    // Compute the user hash from nonce and timestamp
    #[private]
    fn compute_identity_hash(
        name: Field,
        last_name: Field,
        document_type: Field,
        document_number: Field,
    ) -> Field {
        poseidon2::Poseidon2::hash([name, last_name, document_type, document_number], 4)
    }*/
}
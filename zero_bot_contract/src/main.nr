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
        macros::{functions::{initializer, public, private, utility}, storage::storage},
        prelude::{AztecAddress, NoteViewerOptions, PublicImmutable, Map, PrivateSet, PrivateContext},
    };
    use dep::aztec::messages::logs::note::encode_and_encrypt_note;
    use poseidon::poseidon2;

    global FIELD_HASH: Field = 0;
    global FIELD_NAME: Field = 1;
    global FIELD_LAST_NAME: Field = 2;
    global FIELD_DOCUMENT_TYPE: Field = 3;
    global FIELD_DOCUMENT_NUMBER: Field = 4;

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

        _write_field(FIELD_HASH, ethAddress, hash, &mut context, storage);
        _write_field(FIELD_NAME, ethAddress, name, &mut context, storage);
        _write_field(FIELD_LAST_NAME, ethAddress, last_name, &mut context, storage);
        _write_field(FIELD_DOCUMENT_TYPE, ethAddress, document_type, &mut context, storage);
        _write_field(FIELD_DOCUMENT_NUMBER, ethAddress, document_number, &mut context, storage);
  /*
        assert(!storage.hash.at(ethAddress).is_initialized(), "Identity already registered");
*/
    }

    #[contract_library_method]
    fn _write_field(
        field_selector: Field,
        key: Field,
        value: Field,
        context: &mut PrivateContext,
        storage: Storage<&mut PrivateContext>
    ) {
        let owner = context.msg_sender();
        let note = IdentityFieldNote::new(value, owner);

        match field_selector {
            FIELD_HASH => storage.hash.at(key).insert(note).emit(encode_and_encrypt_note(context, owner, owner)),
            FIELD_NAME => storage.name.at(key).insert(note).emit(encode_and_encrypt_note(context, owner, owner)),
            FIELD_LAST_NAME => storage.last_name.at(key).insert(note).emit(encode_and_encrypt_note(context, owner, owner)),
            FIELD_DOCUMENT_TYPE => storage.document_type.at(key).insert(note).emit(encode_and_encrypt_note(context, owner, owner)),
            FIELD_DOCUMENT_NUMBER => storage.document_number.at(key).insert(note).emit(encode_and_encrypt_note(context, owner, owner)),
            _ => assert(false, "Field selector not recognized"),
        }
    }

    // Retrieve the Identity
    #[utility]
    unconstrained fn get_identity(address: Field) -> [Field; 5] {
        let hash_notes = storage.hash.at(address).view_notes(NoteViewerOptions::new().set_limit(1));
        let name_notes = storage.name.at(address).view_notes(NoteViewerOptions::new().set_limit(1));
        let last_name_notes = storage.last_name.at(address).view_notes(NoteViewerOptions::new().set_limit(1));
        let document_type_notes = storage.document_type.at(address).view_notes(NoteViewerOptions::new().set_limit(1));
        let document_number_notes = storage.document_number.at(address).view_notes(NoteViewerOptions::new().set_limit(1));

        assert(hash_notes.len() == 1, "No hash found for this address");
        assert(name_notes.len() == 1, "No name found for this address");
        assert(last_name_notes.len() == 1, "No last name found for this address");
        assert(document_type_notes.len() == 1, "No document type found for this address");
        assert(document_number_notes.len() == 1, "No document number found for this address");

        [
            hash_notes.get_unchecked(0).identity_field,
            name_notes.get_unchecked(0).identity_field,
            last_name_notes.get_unchecked(0).identity_field,
            document_type_notes.get_unchecked(0).identity_field,
            document_number_notes.get_unchecked(0).identity_field,
        ]
    }

    // // Check if an identity is registered
    #[utility]
    unconstrained fn get_identity_hash(address: Field) -> Field {
        let notes = storage.hash.at(address).view_notes(NoteViewerOptions::new().set_limit(1));
        assert(notes.len() == 1, "No identity hash found for this address");
        notes.get_unchecked(0).identity_field
    }
}
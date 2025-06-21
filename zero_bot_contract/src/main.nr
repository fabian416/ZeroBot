mod identity_field_note;
use dep::aztec::macros::aztec;

#[aztec]
pub contract ZeroBot {
    use crate::identity_field_note::IdentityFieldNote;
    use dep::aztec::{
        macros::{functions::{initializer, view, public, private, utility}, storage::storage},
        prelude::{AztecAddress, NoteViewerOptions, SharedMutable, PrivateMutable, PublicMutable, PublicImmutable, Map, PrivateSet, PrivateContext},
    };
    use dep::aztec::messages::logs::note::encode_and_encrypt_note;
    use poseidon::poseidon2;
    use std::ecdsa_secp256k1::verify_signature;

    global FIELD_NAME: Field = 0;
    global FIELD_LAST_NAME: Field = 1;
    global FIELD_DOCUMENT_TYPE: Field = 2;
    global FIELD_DOCUMENT_NUMBER: Field = 3;
    global CHANGE_AUTHORIZED_DELAY_BLOCKS: u32 = 1;

    #[storage]
    struct Storage<Context> {
        admin: PublicImmutable<AztecAddress, Context>,
        authorized: SharedMutable<AztecAddress, CHANGE_AUTHORIZED_DELAY_BLOCKS, Context>,
        name: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
        last_name: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
        document_type: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
        document_number: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
    }

    #[public]
    #[initializer]
    fn constructor(admin: AztecAddress) {
        assert(!admin.is_zero(), "invalid admin");
        storage.admin.initialize(admin);
        storage.authorized.schedule_value_change(admin);
    }

    // docs:start:shared_mutable_schedule
    #[public]
    fn set_authorized(authorized: AztecAddress) {
        assert_eq(storage.admin.read(), context.msg_sender(), "caller is not admin");
        storage.authorized.schedule_value_change(authorized);
        // docs:end:shared_mutable_schedule
    }

    // docs:start:public_getter
    #[public]
    #[view]
    fn get_authorized() -> AztecAddress {
        // docs:start:shared_mutable_get_current_public
        storage.authorized.get_current_value()
        // docs:end:shared_mutable_get_current_public
    }


    #[contract_library_method]
    fn _do_private_authorized_thing(
        context: &mut PrivateContext,
        storage: Storage<&mut PrivateContext>
    ) {
        // Reading a value from authorized in private automatically adds an extra validity condition: the base rollup
        // circuit will reject this tx if included in a block past the block horizon, which is as far as the circuit can
        // guarantee the value will not change from some historical value (due to CHANGE_AUTHORIZED_DELAY_BLOCKS).
        // docs:start:shared_mutable_get_current_private
        let authorized = storage.authorized.get_current_value();
        // docs:end:shared_mutable_get_current_private
        assert_eq(authorized, context.msg_sender(), "caller is not authorized");
    }

    #[private]
    #[view]
    fn get_authorized_in_private() -> AztecAddress {
        storage.authorized.get_current_value()
    }
   
    
    // Create a new identity
    #[private]
    fn create_identity(
        name: Field,
        last_name: Field,
        document_type: Field,
        document_number: Field,
        pub_key_x: [u8; 32],
        pub_key_y: [u8; 32],
        signature: [u8; 64],
        signed_message_hash: [u8; 32],
    ) {
        _do_private_authorized_thing(&mut context, storage);
        let pub_key_hash = _verify_signature(pub_key_x, pub_key_y, signature, signed_message_hash);

        let identity_hash = poseidon2::Poseidon2::hash(
            [name, last_name, document_type, document_number],
            1
        );

        _write_field(FIELD_NAME, identity_hash, name, &mut context, storage);
        _write_field(FIELD_LAST_NAME, identity_hash, last_name, &mut context, storage);
        _write_field(FIELD_DOCUMENT_TYPE, identity_hash, document_type, &mut context, storage);
        _write_field(FIELD_DOCUMENT_NUMBER, identity_hash, document_number, &mut context, storage);
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
            FIELD_NAME => storage.name.at(key).insert(note).emit(encode_and_encrypt_note(context, owner, owner)),
            FIELD_LAST_NAME => storage.last_name.at(key).insert(note).emit(encode_and_encrypt_note(context, owner, owner)),
            FIELD_DOCUMENT_TYPE => storage.document_type.at(key).insert(note).emit(encode_and_encrypt_note(context, owner, owner)),
            FIELD_DOCUMENT_NUMBER => storage.document_number.at(key).insert(note).emit(encode_and_encrypt_note(context, owner, owner)),
            _ => assert(false, "Field selector not recognized"),
        }
    }

    #[contract_library_method]
    fn _verify_signature(
        pub_key_x: [u8; 32],
        pub_key_y: [u8; 32],
        signature: [u8; 64],
        signed_message_hash: [u8; 32],
    ) -> Field {
          // Verify signature with ECDSA secp256k1
        assert(
            verify_signature(
                pub_key_x,
                pub_key_y,
                signature,
                signed_message_hash
            ),
            "Signature invalid"
        );

        let pub_key_x_field = Field::from_le_bytes(pub_key_x);
        let pub_key_y_field = Field::from_le_bytes(pub_key_y);
        let pub_key_hash = poseidon2::Poseidon2::hash(
            [pub_key_x_field, pub_key_y_field],
            1
        );

        pub_key_hash
    }

    // Retrieve the Identity
    #[utility]
    unconstrained fn get_identity(
        pub_key_x: [u8; 32],
        pub_key_y: [u8; 32],
        signature: [u8; 64],
        signed_message_hash: [u8; 32],
    ) -> [Field; 4] {
        let pub_key_hash = _verify_signature(pub_key_x, pub_key_y, signature, signed_message_hash);

        let name_notes = storage.name.at(pub_key_hash).view_notes(NoteViewerOptions::new().set_limit(1));
        let last_name_notes = storage.last_name.at(pub_key_hash).view_notes(NoteViewerOptions::new().set_limit(1));
        let document_type_notes = storage.document_type.at(pub_key_hash).view_notes(NoteViewerOptions::new().set_limit(1));
        let document_number_notes = storage.document_number.at(pub_key_hash).view_notes(NoteViewerOptions::new().set_limit(1));

        assert(name_notes.len() == 1, "No name found for this address");
        assert(last_name_notes.len() == 1, "No last name found for this address");
        assert(document_type_notes.len() == 1, "No document type found for this address");
        assert(document_number_notes.len() == 1, "No document number found for this address");

        [
            name_notes.get_unchecked(0).identity_field,
            last_name_notes.get_unchecked(0).identity_field,
            document_type_notes.get_unchecked(0).identity_field,
            document_number_notes.get_unchecked(0).identity_field,
        ]
    }

    // // Check if an identity is registered
    #[utility]
    unconstrained fn get_identity_hash(
        pub_key_x: [u8; 32],
        pub_key_y: [u8; 32],
        signature: [u8; 64],
        signed_message_hash: [u8; 32],
    ) -> Field {
        let pub_key_hash = _verify_signature(pub_key_x, pub_key_y, signature, signed_message_hash);

        pub_key_hash
/*
        let notes = storage.hash.at(pub_key_hash).view_notes(NoteViewerOptions::new().set_limit(1));
        assert(notes.len() == 1, "No identity hash found for this address");
        notes.get_unchecked(0).identity_field
  */  }
}
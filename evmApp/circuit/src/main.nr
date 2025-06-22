use poseidon::poseidon;
use std::ecdsa_secp256k1::verify_signature;

fn main(
    name: Field,
    last_name: Field,
    document_type: Field,
    document_number: Field,
    expected_hash: pub Field,
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    signature: [u8; 64],
    signed_message_hash: [u8; 32],
) {
    assert(
            verify_signature(
                pub_key_x,
                pub_key_y,
                signature,
                signed_message_hash
            ),
            "Signature invalid"
        );
    // Calculate the hash using the Poseidon hash function
    let hash = poseidon::bn254::hash_4([name, last_name, document_type, document_number]);

    // Verify the hash against the expected hash
    assert(hash == expected_hash);
}

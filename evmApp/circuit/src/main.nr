use poseidon::poseidon;

fn main(
    name: Field,
    last_name: Field,
    document_type: Field,
    document_number: Field,
    expected_hash: pub Field
) {
    // Calculamos el hash como en el contrato Aztec
    let hash = poseidon::bn254::hash_4([name, last_name, document_type, document_number]);

    // Verificamos que coincida con el hash guardado
    assert(hash == expected_hash);
}

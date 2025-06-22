use poseidon::poseidon2;

fn main(
    name: Field,
    last_name: Field,
    document_type: Field,
    document_number: Field,
    expected_hash: pub Field
) {
    // Calculamos el hash como en el contrato Aztec
    let hash = poseidon2::Poseidon2::hash([name, last_name, document_type, document_number], 1);

    // Verificamos que coincida con el hash guardado
    assert(hash == expected_hash);
}

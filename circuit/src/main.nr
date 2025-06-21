fn main(
    private name: Field,
    private last_name: Field,
    private document_type: Field,
    private document_number: Field,
    public expected_hash: Field
) {
    // Calculamos el hash como en el contrato Aztec
    let hash = poseidon2([name, last_name, document_type, document_number]);

    // Verificamos que coincida con el hash guardado
    assert(hash == expected_hash);
}
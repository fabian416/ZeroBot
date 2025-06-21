use dep::aztec::protocol_types::{address::AztecAddress, traits::Packable};
use std::meta::derive;


#[derive(Eq, Packable)]
struct Identity<Context> {
    hash: Field,
    name: Field,
    last_name: Field,
    document_type: Field,
    document_number: Field,
}

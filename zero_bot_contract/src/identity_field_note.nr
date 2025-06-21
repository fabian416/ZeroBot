use dep::aztec::{
    macros::notes::note, oracle::random::random, protocol_types::address::AztecAddress,
};

// docs:start:address_note_def
#[note]
#[derive(Eq)]
pub struct IdentityFieldNote {
    field: Field,
    owner: AztecAddress,
    randomness: Field,
}

impl IdentityFieldNote {
    pub fn new(field: Field, owner: AztecAddress) -> Self {
        // Safety: we use the randomness to preserve the privacy of the note recipient by preventing brute-forcing, so a
        // malicious sender could use non-random values to make the note less private. But they already know the full
        // note pre-image anyway, and so the recipient already trusts them to not disclose this information. We can
        // therefore assume that the sender will cooperate in the random value generation.
        let randomness = unsafe { random() };
        IdentityFieldNote { field, owner, randomness }
    }
}
// docs:end:a
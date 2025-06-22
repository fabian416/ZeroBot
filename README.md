# ZeroBot

A ZK-based Discord verification bot: prove you're human once, and verify everywhere.

![Diagram](docs/diagram.png)

<p align="center">
  <img src="frontend/public/landing.png" alt="ZeroBot Screenshot" style="max-width: 100%; border-radius: 12px;" />
</p>

## 🔍 What It Does

ZeroBot allows Discord users to privately prove they're human using Zero-Knowledge (ZK) proofs. Once verified, users can access any server or channel across the platform, without ever having to deal with CAPTCHAs again.

By leveraging Aztec's privacy features, ZeroBot offers a seamless and secure verification process that doesn't require exposing personal data.

---

## 🧪 How It Works

1. **Create an Identity:** Users sign a challenge using their Ethereum wallet, proving ownership without revealing personal data.
2. **Identity Storage:** User identities are stored privately using Aztec's encrypted state model, ensuring privacy and security.
3. **Reverify Across Servers:** Once verified, users can reuse their identity across multiple servers or channels without re-proving.

---

## 🔒 Privacy and Security

ZeroBot is built on Aztec's testnet, utilizing its advanced privacy-preserving features like shielded transactions and private smart contracts. This guarantees that user data remains private and secure at all times.

Key components:
- **Private Identity Storage:** User identities are stored off-chain in encrypted, private storage.
- **Signature Verification:** Users' Ethereum wallets are used to sign a challenge, proving their identity cryptographically.
- **No More CAPTCHAs:** Once a user proves their humanity, they can seamlessly verify across any Discord channel.

---

## 🔧 Contract Logic

The ZeroBot smart contract allows users to create and verify identities. Here's a simplified version of the key contract logic:

```rust
#[storage]
struct Storage<Context> {
    admin: PublicImmutable<AztecAddress, Context>,
    authorized: SharedMutable<AztecAddress, CHANGE_AUTHORIZED_DELAY_BLOCKS, Context>,
    name: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
    last_name: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
    document_type: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
    document_number: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
    hash: Map<Field, PrivateSet<IdentityFieldNote, Context>, Context>,
    public_key: Map<Field, PrivateSet<EcdsaPublicKeyNote, Context>, Context>,
}


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

    let this = context.this_address();
    let pub_key_note = EcdsaPublicKeyNote::new(pub_key_x, pub_key_y, this);

    storage.public_key.at(identity_hash).insert(pub_key_note);
    _write_field(FIELD_NAME, identity_hash, name, &mut context, storage);
    _write_field(FIELD_LAST_NAME, identity_hash, last_name, &mut context, storage);
    _write_field(FIELD_DOCUMENT_TYPE, identity_hash, document_type, &mut context, storage);
    _write_field(FIELD_DOCUMENT_NUMBER, identity_hash, document_number, &mut context, storage);
    _write_field(FIELD_HASH, pub_key_hash, identity_hash, &mut context, storage);
}
```

This contract ensures that user data is securely signed and stored privately while allowing for reusable identity validation.

---

## 🧱 Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Aztec SDK, Zero-Knowledge Proofs (ZKPs)
- **Blockchain**: Aztec Testnet (privacy-preserving layer)
- **Smart Contracts**: Aztec's private smart contracts for identity storage and verification
- **Signing**: Ethereum wallet for identity signing

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/fabian416/ZeroBot
cd ZeroBot
```

### 2. Backend Configuration

#### 2.1 Create your Discord bot (required for .env)

To integrate ZeroBot with Discord servers, you'll need to create a Discord application and bot:

1. **Create a new Discord application:**
   - Go to https://discord.com/developers/applications
   - Click "New Application" and give it a name (e.g., "ZeroBot")
   - Navigate to the "Bot" section in the left sidebar

2. **Configure the bot:**
   - Click "Add Bot" to create a bot user
   - Under the "Token" section, click "Copy" to copy your bot token
   - **Important:** Keep this token secure and never share it publicly

3. **Set bot permissions:**
   - Go to the "OAuth2" → "URL Generator" section
   - Select "bot" scope
   - Select the following bot permissions:
     - Send Messages
     - Read Message History
     - Use Slash Commands
     - Manage Roles (for verification role assignment)

4. **Invite the bot to your test server:**
   - Copy the generated URL and open it in your browser
   - Select a Discord server where you have admin permissions
   - Authorize the bot

#### 2.2 Install dependencies and start the backend

```bash
cd backend
cp .env.example .env
# Edit .env file with your Discord bot token and other required variables
bun install
bun run dev
```

**Note:** Make sure to update your `.env` file with:
- `TOKEN`: Your Discord bot token from step 2.1
- Any other required environment variables listed in `.env.example`

### 3. Install dependencies and start the frontend
```bash
cd frontend
cp .env.example .env
yarn install
yarn start
```



Visit `http://localhost:3002` to start the demo.

---

## 📁 Folder Structure

- `/frontend` — Frontend application for user interaction and communication with Aztec smart contracts
- `/backend` — Handles the communication between the bot and the Discord channel, along with identity creation and verification. 
- `/zero_bot_contract` — Smart contract code for identity storage and signature verification

---

## 🤝 Credits

Built with ❤️ for the zk Hack Berlin.

---
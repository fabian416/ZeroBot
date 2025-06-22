import { UltraHonkBackend } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import circuit from "../circuits/circuit.json";
import * as circomlib from 'circomlibjs';

export default function ProofGeneration() {
  
    async function hashInputs(params: {name: string, last_name: string, document_type: string, document_number: string}) {
        const poseidon = await circomlib.buildPoseidon();

        let values: { [key: string]: bigint } = {};

        for (const [key, value] of Object.entries(params)) {
            try {
                values[key] = BigInt(value);
            } catch (error) {
                const valueBigInt = BigInt('0x' + Buffer.from(value).toString('hex'));
                values[key] = valueBigInt;
            }
        }

        const hash = poseidon([values.name, values.last_name, values.document_type, values.document_number]);

        return {
            hash,
            name: values.name,
            last_name: values.last_name,
            document_type: values.document_type,
            document_number: values.document_number
        };
    }

    async function generateProof(params: any) {
        try {
            const noir = new Noir(circuit as any);
            const backend = new UltraHonkBackend(circuit.bytecode);
            const poseidon = await circomlib.buildPoseidon();
            
            // Hashing name, last_name, document_type, document_number to make the expected_hash
            const { hash, name, last_name, document_type, document_number } = await hashInputs(params);
            
            console.log(hash, name, last_name, document_type, document_number)

            const hashBigInt = poseidon.F.toObject(hash) 

            const inputs = {
                name: name.toString(),
                last_name: last_name.toString(),
                document_type: document_type.toString(),
                document_number: document_number.toString(),
                expected_hash: hashBigInt.toString()
            }

            const {witness} = await noir.execute(inputs)

            const proof = await backend.generateProof(witness);

            console.log("proof", proof)

            return proof;
            
        } catch (error) {
            console.error("error", error);
        }
    }

    return (
        <div>
            <button onClick={() => generateProof({
                name: "John",
                last_name: "Doe",
                document_type: "1",
                document_number: "1234567890",
                expected_hash: "1234567890"
            })}>Generate Proof</button>
        </div>
  )
}

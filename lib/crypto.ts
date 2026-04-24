import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

const encode = (s: string): Uint8Array => new TextEncoder().encode(s);
const decode = (u: Uint8Array): string => new TextDecoder().decode(u);

function getServerPublicKey(): Uint8Array {
  const key = process.env.SERVER_PUBLIC_KEY;
  if (!key || key === 'base64_encoded_public_key_here') {
    throw new Error('SERVER_PUBLIC_KEY not configured');
  }
  return decodeBase64(key);
}

function getServerSecretKey(): Uint8Array {
  const key = process.env.SERVER_SECRET_KEY;
  if (!key || key === 'base64_encoded_secret_key_here') {
    throw new Error('SERVER_SECRET_KEY not configured');
  }
  return decodeBase64(key);
}

export function encryptForServer(plaintext: string): { encrypted: Uint8Array; nonce: Uint8Array } {
  const serverPubKey = getServerPublicKey();
  const ephemeralKeypair = nacl.box.keyPair();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = encode(plaintext);

  const ciphertext = nacl.box(messageBytes, nonce, serverPubKey, ephemeralKeypair.secretKey);

  // Prepend ephemeral public key so server can decrypt
  const combined = new Uint8Array(nacl.box.publicKeyLength + ciphertext.length);
  combined.set(ephemeralKeypair.publicKey);
  combined.set(ciphertext, nacl.box.publicKeyLength);

  return { encrypted: combined, nonce };
}

export function decryptFromWhistleblower(combinedBuf: Buffer | Uint8Array, nonceBuf: Buffer | Uint8Array): string {
  const serverSecretKey = getServerSecretKey();
  const combined = combinedBuf instanceof Buffer ? new Uint8Array(combinedBuf) : combinedBuf;
  const nonce = nonceBuf instanceof Buffer ? new Uint8Array(nonceBuf) : nonceBuf;

  const ephemeralPubKey = combined.slice(0, nacl.box.publicKeyLength);
  const ciphertext = combined.slice(nacl.box.publicKeyLength);

  const decrypted = nacl.box.open(ciphertext, nonce, ephemeralPubKey, serverSecretKey);
  if (!decrypted) throw new Error('Decryption failed');
  return decode(decrypted);
}

export function generateServerKeypair(): { publicKey: string; secretKey: string } {
  const keypair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keypair.publicKey),
    secretKey: encodeBase64(keypair.secretKey),
  };
}

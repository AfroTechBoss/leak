import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

export function getServerPublicKey(): Uint8Array {
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
  const messageBytes = encodeUTF8(plaintext);

  const encrypted = nacl.box(messageBytes, nonce, serverPubKey, ephemeralKeypair.secretKey);

  // Prepend ephemeral public key to encrypted payload so server can decrypt
  const combined = new Uint8Array(nacl.box.publicKeyLength + encrypted.length);
  combined.set(ephemeralKeypair.publicKey);
  combined.set(encrypted, nacl.box.publicKeyLength);

  return { encrypted: combined, nonce };
}

export function decryptFromWhistleblower(combined: Uint8Array, nonce: Uint8Array): string {
  const serverSecretKey = getServerSecretKey();
  const ephemeralPubKey = combined.slice(0, nacl.box.publicKeyLength);
  const ciphertext = combined.slice(nacl.box.publicKeyLength);

  const decrypted = nacl.box.open(ciphertext, nonce, ephemeralPubKey, serverSecretKey);
  if (!decrypted) throw new Error('Decryption failed');
  return decodeUTF8(decrypted);
}

export function encryptSymmetric(plaintext: string): { encrypted: Uint8Array; nonce: Uint8Array } {
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const encrypted = nacl.secretbox(encodeUTF8(plaintext), nonce, key);
  // Prepend key (wrapped by server pub key) — for simplicity using server secret key here
  // In production, wrap this key with the server's public key
  const serverSecretKey = getServerSecretKey();
  const wrappedKey = nacl.secretbox(key, nonce, serverSecretKey.slice(0, 32));
  const combined = new Uint8Array(wrappedKey.length + encrypted.length);
  combined.set(wrappedKey);
  combined.set(encrypted, wrappedKey.length);
  return { encrypted: combined, nonce };
}

export function decryptSymmetric(combined: Uint8Array, nonce: Uint8Array): string {
  const serverSecretKey = getServerSecretKey();
  const keyLength = nacl.secretbox.keyLength + 16; // secretbox overhead
  const wrappedKey = combined.slice(0, keyLength);
  const ciphertext = combined.slice(keyLength);
  const key = nacl.secretbox.open(wrappedKey, nonce, serverSecretKey.slice(0, 32));
  if (!key) throw new Error('Key decryption failed');
  const plaintext = nacl.secretbox.open(ciphertext, nonce, key);
  if (!plaintext) throw new Error('Decryption failed');
  return decodeUTF8(plaintext);
}

export function generateServerKeypair(): { publicKey: string; secretKey: string } {
  const keypair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keypair.publicKey),
    secretKey: encodeBase64(keypair.secretKey),
  };
}

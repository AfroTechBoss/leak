// Run: node scripts/gen-keypair.js
// Copy the output into your .env.local
const nacl = require('tweetnacl');
const { encodeBase64 } = require('tweetnacl-util');

const keypair = nacl.box.keyPair();
console.log('SERVER_PUBLIC_KEY=' + encodeBase64(keypair.publicKey));
console.log('SERVER_SECRET_KEY=' + encodeBase64(keypair.secretKey));

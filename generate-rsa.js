const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

console.log('⏳ Generating 2048-bit RSA Key Pair (This may take a few seconds)...');

// Generate Key Pair
const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048);

// Convert to PEM format
const privatePem = forge.pki.privateKeyToPem(privateKey);
const publicPem = forge.pki.publicKeyToPem(publicKey);

// Ensure keys directory exists
const keysDir = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir);

// Save Private Key
fs.writeFileSync(path.join(keysDir, 'private_key.pem'), privatePem);
// Save Public Key (for reference)
fs.writeFileSync(path.join(keysDir, 'public_key.pem'), publicPem);

console.log('✅ Keys generated successfully!');
console.log('---------------------------------------------------------');
console.log('1. PRIVATE KEY: Saved to keys/private_key.pem (KEEP THIS SECRET)');
console.log('2. PUBLIC KEY: Copy the text below into your Desktop App:');
console.log('---------------------------------------------------------');
console.log(publicPem);
console.log('---------------------------------------------------------');

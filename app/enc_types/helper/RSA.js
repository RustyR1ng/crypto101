const NodeRSA = require('node-rsa');

const key = new NodeRSA({b: 512});

let exp = key.generateKeyPair();

function enRSA(Text, key)

const text = 'Hello RSA!';
const encrypted = key.encrypt(text, 'base64');
console.log('encrypted: ', encrypted);
const decrypted = key.decrypt(encrypted, 'utf8');
console.log('decrypted: ', decrypted);
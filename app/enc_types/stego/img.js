const fs = require('fs')
const steggy = require('steggy')

function encrypt(pathToImg, msg) {
    const imgBuffer = fs.readFileSync(pathToImg) // buffer
    const concealed = steggy.conceal(/* optional password */)(imgBuffer, msg /*, encoding */)
    return concealed
}

function decrypt(pathToImg) {
    const image = fs.readFileSync(pathToImg)
    // Returns a string if encoding is provided, otherwise a buffer
    const revealed = steggy.reveal(/* optional password */)(image /*, encoding */)
    return revealed.toString()
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
}

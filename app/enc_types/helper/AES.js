const { scryptSync, createDecipheriv, createCipheriv, createHash } = require('crypto')

function enAES(Text, Key) {
    const algorithm = 'aes-256-cbc'
    const password = Key

    let hashKey = scryptSync(password, 'salt', 32)

    let iv = scryptSync(password, 'salt', 16)
    for (let i = 0; i < Math.pow(2, 9); i++) {
        iv = createHash('SHA256').update(iv).digest('hex').slice(0, 16)
    }
    const cipher = createCipheriv('aes-256-cbc', hashKey, iv)

    let encrypted = cipher.update(Text, 'utf8', 'Base64')
    encrypted += cipher.final('Base64')

    return encrypted
}

function decAES(Text, Key) {
    const algorithm = 'aes-256-cbc'
    const password = Key

    const hashKey = scryptSync(password, 'salt', 32)

    let iv = scryptSync(password, 'salt', 16)
    for (let i = 0; i < Math.pow(2, 9); i++) {
        iv = createHash('SHA256').update(iv).digest('hex').slice(0, 16)
    }

    const decipher = createDecipheriv('aes-256-cbc', hashKey, iv)

    let decrypted = decipher.update(Text, 'Base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}

module.exports = {
    enAES,
    decAES
}

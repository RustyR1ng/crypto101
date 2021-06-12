const express = require('express')
const { redirect, sendfile } = require('express/lib/response')
const router = express.Router()
const http = require('http'),
    formidable = require('formidable'),
    util = require('util'),
    fs = require('fs')

const tempFolder = './temp/'
const encDir = '../enc_types/'
const types = require(encDir + 'types') 

const stegoImg = require(encDir + 'helper/img'),
    AES = require(encDir + 'helper/AES'),
    WAV = require(encDir + 'helper/WAV')

/* GET home page. */
router.get('/', function (req, res, next) {
    //res.download('./app/public/images/test.jpg')
    res.render('index', { title: '101 Encryptor', types: types })
})

router.post('/', function (req, res, next) {
    const form = formidable.IncomingForm({ multiples: true })

    form.parse(req, (err, fields, files) => {
        const msg = fields.msg,
            key = fields.key,
            encType = fields.enc_type
        console.log(fields)

        if (!msg) {
            console.log(msg)
            return res.redirect('/#shifr-page') 
        }
        switch (encType) {
            case types.stegoImg.key: {
                img = stegoImg.encrypt(files.asset.path, msg)
                console.log(img) 
                enc_img = sendFile(res, img, 'stegoImg', 'png')
                console.log(stegoImg.decrypt(enc_img))
                break
            }
            case types.cryptoAES.key: {
                cipher = AES.enAES(msg, key)
                cipher_file = sendFile(res,cipher,'cryptoAES','txt')
                Mydecipher = AES.decAES(cipher,key)
                console.log(Mydecipher)
                break
            }
            case types.stegoWAV.key: {
                wav = WAV.enWAV(msg, files.asset.path)
                console.log(wav)
                enc_wav = sendFile(res, wav, 'stegoWAV', 'wav')
                /* dec_wav = WAV.decWAV(key, files.asset.path)
                console.log(dec_wav) */
                break
            }
            case types.cryptoDES.key:{
                
            }
            default: {
                console.log(encType)
                return res.redirect('/#shifr-page')
            }
        }
    })
})

function sendFile(res, file, name, ext) {
    if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder)
    }
    filePath = tempFolder + `${name}.${ext}`
    fs.writeFileSync(filePath, file)
    res.download(filePath)
    return filePath
}

module.exports = router

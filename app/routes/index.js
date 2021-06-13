const express = require('express'),
    { redirect, sendfile } = require('express/lib/response'),
    router = express.Router()

const http = require('http'),
    formidable = require('formidable'),
    util = require('util'),
    fs = require('fs')

const tempFolder = './temp/'

const encDir = '../enc_types/'
const types = require(encDir + 'types')

const stegoImg = require(encDir + 'helper/img'),
    AES = require(encDir + 'helper/AES'),
    WAV = require(encDir + 'helper/WAV'),
    MP3 = require(encDir + 'helper/MP3'),
    CHA = require(encDir + 'helper/CHACHA20')

/* GET home page. */
router.get('/', function (req, res, next) {
    //res.download('./app/public/images/test.jpg')
    res.render('index', { title: '101 Encryptor', types: types })
})

router.post('/', function (req, res, next) {
    const form = formidable.IncomingForm({ multiples: true })

    let msg, key, encType, asset

    form.parse(req, (err, fields, files) => {
        msg = fields.msg
        key = fields.key
        encType = fields.enc_type
        asset = files.asset
        crypt = true ? fields.encrypt : false
        console.log('CRY', crypt)

        console.log(fields, asset)
        switch (encType) {
            case types.stegoImg.key: {
                stegoImgHandle(res, crypt, msg, asset)
                break
            }

            case types.cryptoAES.key: {
                try {
                    cryptoAESHandle(res, crypt, msg, key)
                } catch (error) {
                    console.log(error)
                    res.redirect('/#shifr-page')
                }
                break
            }

            case types.stegoWAV.key: {
                stegoWAVHandle(res, crypt, msg, asset)
                break
            }

            case types.cryptoCHA.key: {
                try {
                    cryptoCHAHandle(res, crypt, msg, key)
                } catch (error) {
                    console.log(error)
                    res.redirect('/#shifr-page')
                }
                break
            }

            case types.stegoMP3.key: {
                stegoMP3Handle(res, crypt, msg, asset)
                break
            }

            default: {
                console.log('Enc Type', encType)
                res.redirect('/#shifr-page')
            }
        }
    })
})

function stegoImgHandle(res, sw, msg, asset) {
    console.log('StegoImg')
    if (!asset) return
    let format, name
    if (sw) {
        resImg = stegoImg.encrypt(asset.path, msg)
        format = 'png'
        name = 'stegoImg'
    } else {
        resImg = stegoImg.decrypt(asset.path)
        format = 'txt'
        name = 'decryptImg'
    }
    file = sendFile(res, resImg, name, format)
    console.log(resImg, file)
}
function stegoWAVHandle(res, sw, msg, asset) {
    console.log('WAV')
    let format, name 
    if (!asset) return
    if (sw) {
        resWav = WAV.enWAV(msg, asset.path)
        format = 'wav'
        name = 'stegoWAV'
    } else {
        resWav = WAV.decWAV(asset.path)
        format = 'txt'
        name = 'decryptWAV'
    }
    file = sendFile(res, resWav, name, format)
    console.log(resWav, file)
}

function stegoMP3Handle(res, sw, msg, asset){
    console.log('MP3')
    let format, name 
    if (!asset) return
    if (sw) {
        resWav = MP3.enMP3(msg, asset.path)
        format = 'mp3'
        name = 'stegoMP3'
    } else {
        resWav = MP3.decMP3(asset.path)
        format = 'txt'
        name = 'decryptMP3'
    }
    file = sendFile(res, resWav, name, format)
    console.log(resWav, file)
}

function cryptoAESHandle(res, sw, msg, key) {
    console.log('AES')
    let name
    if (sw) {
        console.log('Enc')
        resMsg = AES.enAES(msg, key)
        name = 'cryptoAES'
    } else {
        console.log('Dec')
        resMsg = AES.decAES(msg, key)
        name = 'decryptAES'
    }

    file = sendFile(res, resMsg, name, 'txt')
    console.log(resMsg, file)
}

function cryptoCHAHandle(res, sw, msg, key) {
    console.log('DES')
    let name
    if (sw) {
        console.log('Enc')
        resMsg = CHA.enCHA(msg, key)
        name = 'cryptoCHA'
    } else {
        console.log('Dec')
        resMsg = CHA.decCHA(msg, key)
        name = 'decryptCHA'
    }

    file = sendFile(res, resMsg, name, 'txt')
    console.log(resMsg, file)
}

function sendFile(res, file, name, ext) {
    console.log('Sending File')
    if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder)
    }
    filePath = tempFolder + `${name}.${ext}`
    fs.writeFileSync(filePath, file)
    res.download(filePath)
    return filePath
}

module.exports = router

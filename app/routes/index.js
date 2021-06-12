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
    WAV = require(encDir + 'helper/WAV')

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

            case types.cryptoDES.key: {
                cryptoDESHandle(res, crypt, msg, key)
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
    if (sw) {
        resImg = stegoImg.encrypt(asset.path, msg)
    } else {
        resImg = stegoImg.decrypt(asset.path)
    }
    file = sendFile(res, resImg, 'stegoImg', 'png')
    console.log(resImg, file)
}
function stegoWAVHandle(res, sw, msg, asset) {
    console.log('WAV')
    if (!asset) return
    if (sw) {
        resWav = WAV.enWAV(msg, asset.path)
    } else {
        resWav = WAV.decWAV(asset.path)
    }
    file = sendFile(res, resWav, 'stegoWAV', 'wav')
    console.log(resWav, file)
}

function cryptoAESHandle(res, sw, msg, key) {
    console.log('AES')
    if (sw) {
        console.log('Enc')
        resMsg = AES.enAES(msg, key)
    } else {
        console.log('Dec')
        resMsg = AES.decAES(msg, key)
    }

    file = sendFile(res, resMsg, 'cryptoAES', 'txt')
    console.log(resMsg, file)
}

function cryptoDESHandle(res, sw, msg, key) {
    console.log('DES')
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

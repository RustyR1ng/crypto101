const wavefile = require("wavefile")
const fs = require ("fs")

function enWAV(textToHide, pathToFile){
  let wav = new wavefile.WaveFile(fs.readFileSync(pathToFile));

  wav.setiXML(textToHide)

  return wav.toBuffer()
}

function decWAV(pathToFile){
  let wav = new wavefile.WaveFile(fs.readFileSync(pathToFile));

  let iXMLValue = wav.getiXML();

  return iXMLValue
}

module.exports = {
  enWAV,
  decWAV,
}
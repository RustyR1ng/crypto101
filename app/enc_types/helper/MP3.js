var Base32 = {

  encode : function(input) {

      var arr = [];
      var chr1, chr2, chr3, chr4, chr5;
      var enc1, enc2, enc3, enc4, enc5, enc6, enc7, enc8;
      var i = 0;

      while (i < input.length) {

          chr1 = input[i++];
          chr2 = input[i++];
          chr3 = input[i++];
          chr4 = input[i++];
          chr5 = input[i++];

          enc1 = chr1 >> 3;
          enc2 = ((chr1 & 7) << 2)  | (chr2 >> 6);
          enc3 = ((chr2 >> 1) & 31);
          enc4 = ((chr2 & 1) << 4)  | (chr3 >> 4);
          enc5 = ((chr3 & 15) << 1) | (chr4 >> 7);
          enc6 = ((chr4 >> 2) & 31);
          enc7 = ((chr4 & 3) << 3)  | (chr5 >> 5);
          enc8 = chr5 & 31;

          if (!isNaN(chr5)) {
              arr.push(enc1, enc2, enc3, enc4, enc5, enc6, enc7, enc8);
          } else {
              if (isNaN(chr2)) {
                  arr.push(enc1, enc2);
              } else if (isNaN(chr3)) {
                  arr.push(enc1, enc2, enc3, enc4);
              } else if (isNaN(chr4)) {
                  arr.push(enc1, enc2, enc3, enc4, enc5);
              } else if (isNaN(chr5)) {
                  arr.push(enc1, enc2, enc3, enc4, enc5, enc6, enc7);
              }
          }
      }

      return arr;
  },

  decode : function(input) {

      var arr = [];
      var chr1, chr2, chr3, chr4, chr5;
      var enc1, enc2, enc3, enc4, enc5, enc6, enc7, enc8;
      var i = 0;

      while (i < input.length) {

          enc1 = input[i++];
          enc2 = input[i++];
          enc3 = input[i++];
          enc4 = input[i++];
          enc5 = input[i++];
          enc6 = input[i++];
          enc7 = input[i++];
          enc8 = input[i++];

          chr1 = (enc1 << 3) | (enc2 >> 2);
          chr2 = ((enc2 & 3) << 6)  | (enc3 << 1) | (enc4 >> 4);
          chr3 = ((enc4 & 15) << 4) | (enc5 >> 1);
          chr4 = ((enc5 & 1) << 7)  | (enc6 << 2) | (enc7 >> 3);
          chr5 = ((enc7 & 7) << 5)  |  enc8;

          if (!isNaN(enc8)) {
              arr.push(chr1, chr2, chr3, chr4, chr5);
          } else {
              if (isNaN(enc3)) {
                  arr.push(chr1);
              } else if (isNaN(enc5)) {
                  arr.push(chr1, chr2);
              } else if (isNaN(enc6)) {
                  arr.push(chr1, chr2, chr3);
              } else {
                  arr.push(chr1, chr2, chr3, chr4);
              }
          }
      }

      return arr;
  }
};

// ------------------------------------------------------------------------------------------

// Taken from google closure library
// Convert UTF-16 string -> UTF-8 byte array
function encodeUTF8(str) {
  var out = [], p = 0;
  for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 128) {
          out[p++] = c;
      } else if (c < 2048) {
          out[p++] = (c >> 6) | 192;
          out[p++] = (c & 63) | 128;
      } else if (
          ((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
          ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
          // Surrogate Pair
          c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
          out[p++] = (c >> 18) | 240;
          out[p++] = ((c >> 12) & 63) | 128;
          out[p++] = ((c >> 6) & 63) | 128;
          out[p++] = (c & 63) | 128;
      } else {
          out[p++] = (c >> 12) | 224;
          out[p++] = ((c >> 6) & 63) | 128;
          out[p++] = (c & 63) | 128;
      }
  }
  return out;
}

// Convert UTF-8 byte array -> UTF-16 string
function decodeUTF8(bytes) {
  var out = [], pos = 0, c = 0;
  var c1, c2, c3, c4;
  while (pos < bytes.length) {
      c1 = bytes[pos++];
      if (c1 < 128) {
          out[c++] = String.fromCharCode(c1);
      } else if (c1 > 191 && c1 < 224) {
          c2 = bytes[pos++];
          out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
      } else if (c1 > 239 && c1 < 365) {
          // Surrogate Pair
          c2 = bytes[pos++];
          c3 = bytes[pos++];
          c4 = bytes[pos++];
          var u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) -
              0x10000;
          out[c++] = String.fromCharCode(0xD800 + (u >> 10));
          out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
      } else {
          c2 = bytes[pos++];
          c3 = bytes[pos++];
          out[c++] =
              String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
      }
  }
  return out.join("");
}


// ------------------------------------------------------------------------------------------------------


function MP3Parser(arrayBuffer) {
  // Init stuff
  var buffer = new Uint8Array(arrayBuffer);
  var start = 0;
  var current = 0;
  var end = buffer.byteLength;

  var bitrateTable = [
      0, 32, 40, 48,
      56, 64, 80, 96,
      112, 128, 160, 192,
      224, 256, 320, 0
  ];

  var srateTable = [
      44.1, 48.0, 32.0, 0.0
  ];

  // Helper variables for unpacking the frame header
  var bitrate, srate, padding;

  // Decode synchsafe integer
  var _synchToInt = function(b) {
      return b[3] | (b[2] << 7) | (b[1] << 14) | (b[0] << 21);
  };

  // Detect tags and skip them (ID3v1 and ID3v2)
  var _skipTags = function() {
      // ID3v1
      var triplet = buffer.slice(end - 128, end - 125);
      var str = String.fromCharCode.apply(String, triplet);
      if (str == "TAG") {
          end = end - 128; // skip
      }
      // ID3v2
      triplet = buffer.slice(0, 3);
      str = String.fromCharCode.apply(String, triplet);
      if (str == "ID3") {
          var size = buffer.slice(6, 10);
          current = start = _synchToInt(size) + 10;
      }
  };

  // Unpack frame header audio metadata
  var _unpack = function() {
      var byte = buffer[current + 2];
      bitrate = bitrateTable[byte >> 4];
      srate = srateTable[(byte & 0x0C) >> 2];
      padding = (byte & 0x02) >> 1;
  };

  _skipTags();

  // Get two least significant bytes of a frame header
  this.getFrameHeader = function() {
      return buffer.slice(current + 2, current + 4);
  };

  // Set two least significant bytes of a frame header
  this.setFrameHeader = function(header) {
      buffer[current + 2] = header[0];
      buffer[current + 3] = header[1];
  };

  this.nextFrame = function() {
      _unpack();
      var offset = Math.trunc(144 * bitrate / srate + padding);
      current += offset;
  };

  this.hasNext = function() {
      return current < end;
  };

  this.seekStart = function() {
      current = start;
  };

  this.getRaw = function() {
      return buffer;
  };
}


// ------------------------------------------------------------------------------------------------------------------------------


function MP3Stego(arrayBuffer) {
  // Init private members
  var mp3 = new MP3Parser(arrayBuffer);

  // Sets the flag indicating if a file has been modified.
  // Sets num, which represents the number of frames to read
  // when extracting the file again.
  var _setSignature = function(num) {
      mp3.seekStart();
      _embed(0x1F);   // Set file modified flag
      mp3.nextFrame();
      for (var i = 0; i < 4; i++) {
          _embed((num >> i * 5) & 0x1F);
          mp3.nextFrame();
      }
  };

  // Get the number of frames to be read
  var _getSignature = function() {
      mp3.seekStart();
      mp3.nextFrame();   // Skip flag
      var num = 0;
      for (var i = 0; i < 4; i++) {
          num = num | _extract() << i * 5;
          mp3.nextFrame();
      }
      return num;
  };

  // Embed payload (5 bits) into frame header
  var _embed = function(payload) {
      var header = mp3.getFrameHeader();
      header[0] = (header[0] & 0xFE) | payload >> 4;
      header[1] = (header[1] & 0xF0) | payload & 0x0F;
      mp3.setFrameHeader(header);
  };

  // Extract payload from frame header
  var _extract = function() {
      var header = mp3.getFrameHeader();
      return (header[0] & 0x01) << 4 | (header[1] & 0x0F);
  };

  var _countFrames = function() {
      var frames = 0;
      while (mp3.hasNext()) {
          frames++;
          mp3.nextFrame();
      }
      return frames;
  };

  // Check if file has been previously modified
  this.isModified = function() {
      mp3.seekStart();
      return _extract() == 0x1F;
  };

  // Returns how many characters can be embedded
  // 5 frames are reserved for signature (1 + 4)
  // 13 frames are reserved for encryption (salt + IV)
  this.spaceLeft = function() {
      var frameCount = _countFrames();
      frameCount = frameCount - 5 - 13;
      return Math.trunc(((frameCount * 5) + 1) / 8);
  };

  // Embed message into frame headers
  this.embedText = function(message) {
      // Split message into chunks of 5 bits
      var enc = Base32.encode(message);
      _setSignature(enc.length);
      for (var i = 0; i < enc.length; i++) {
          _embed(enc[i]);
          mp3.nextFrame();
      }
  };

  // Extract message from frame headers
  this.extractText = function() {
      var enc = [];
      var frames = _getSignature();
      for (var i = 0; i < frames; i++) {
          enc.push(_extract());
          mp3.nextFrame();
      }
      return Base32.decode(enc);
  };

  this.download = function() {
      return mp3.getRaw()
  }
  
}

// --------------------------------------------------------------------------------------------------------------------

const fs = require("fs")

function toArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function enMP3(Text,PathToFile) {
  let binaryFile = fs.readFileSync(PathToFile)
  console.log(binaryFile)
  let arrBinaryFile = toArrayBuffer(binaryFile)
  console.log(arrBinaryFile)
  let mp3 = new MP3Stego(arrBinaryFile)
  mp3.embedText(encodeUTF8(Text))
  let finBuf = Buffer.from(mp3.download())
  /* fs.writeFileSync("123.mp3", finBuf) */
  return finBuf
}

function decMP3(PathToFile) {
    let binaryFile = fs.readFileSync(PathToFile)
    console.log(binaryFile)
    let arrBinaryFile = toArrayBuffer(binaryFile)
    console.log(arrBinaryFile)
    let mp3 = new MP3Stego(arrBinaryFile)
    let result = mp3.extractText()

    return decodeUTF8(result);
}

/* console.log(enMP3("1234 Привет Hello", "short.mp3"))
console.log(decMP3("steg.mp3")) */

module.exports = {
  enMP3,
  decMP3,
}
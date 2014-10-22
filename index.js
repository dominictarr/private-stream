
var handshake = require('pull-handshake')
var crypto = require('crypto')
var through = require('pull-through')
var pull = require('pull-stream')

function isString(s) {
  return 'string' === typeof s
}

function cipherStream (cipher) {
  return through(function (data) {
    var _data = cipher.update(data, isString(data) ? 'utf8' : null)
    if(_data) this.queue(_data)
  }, function () {
    var _data = cipher.final()
    if(_data.length) this.queue(_data)
    this.queue(null)
  })
}

module.exports = function (dh, alg) {
  dh = dh || 'modp5'
  alg = alg || 'aes-256-cbc'
  return function (stream) {
    var encrypt = crypto.getDiffieHellman(dh)
    var decrypt = crypto.getDiffieHellman(dh)

    encrypt.generateKeys()
    decrypt.generateKeys()

    return handshake(function (cb) {
      cb(null, Buffer.concat([encrypt.getPublicKey(),decrypt.getPublicKey()]))
    }, function (_, yours) {
      var length = encrypt.getPublicKey().length
      var yourEncrypt = yours.slice(0, length)
      var yourDecrypt = yours.slice(length, length*2)
      var enKey = encrypt.computeSecret(yourDecrypt)
      var deKey = decrypt.computeSecret(yourEncrypt)

      return {
        source: pull(
          stream.source,
          cipherStream(crypto.createCipher(alg, deKey))
        ),
        sink: pull(
          cipherStream(crypto.createDecipher(alg, enKey)),
          stream.sink
        )
      }
    })
  }
}

module.exports.cipher = cipherStream

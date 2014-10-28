var crypto = require('crypto')
var pull = require('pull-stream')
var deferredThrough = require('./resume')
var header = require('./header')
var peek = require('./peek')
var cipher = require('./cipher')

module.exports = function (dh, alg) {

  dh = dh || 'modp5'
  alg = alg || 'aes-256-cbc'
  return function (stream) {
    var encryptDH = crypto.getDiffieHellman(dh)
    var decryptDH = crypto.getDiffieHellman(dh)

    encryptDH.generateKeys()
    decryptDH.generateKeys()

    var length = encryptDH.getPublicKey().length

    var encrypt = cipher.encrypt(alg)
    var decrypt = cipher.decrypt(alg)

    var keys = Buffer.concat([
          encryptDH.getPublicKey(),
          decryptDH.getPublicKey()
        ])

    return {
      sink: pull(
        header(length*2, function (head) {
          decrypt.secret(decryptDH.computeSecret(head.slice(0, length)))
          encrypt.secret(encryptDH.computeSecret(head.slice(length, length*2)))
        }),
        peek(),
        decrypt,
        stream.sink
      ),
      source:
        pull(
          stream.source,
          encrypt,
          pull.prepend(keys)
        )
    }
  }
}


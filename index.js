var crypto = require('crypto')
var pull = require('pull-stream')
var header = require('pull-header')
var peek = require('pull-peek')
var cipher = require('./cipher')

function genDH (mod, len) {
  var dh
  do {
    dh = crypto.getDiffieHellman(mod)
    dh.generateKeys()
  } while(dh.getPublicKey().length % 2)
  return dh
}

module.exports = function (dh, alg) {

  dh = dh || 'modp5'
  alg = alg || 'aes-256-cbc'
  return function (stream) {
    var encryptDH = genDH(dh)
    var decryptDH = genDH(dh)
    var l1 = encryptDH.getPublicKey().length
    var l2 = decryptDH.getPublicKey().length

    if(l1 != l2)
      throw new Error('mismatched lengths:'+l1 +' '+l2)

    var length = l1

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
      source: pull(
        stream.source,
        encrypt,
        pull.prepend(keys)
      )
    }
  }
}


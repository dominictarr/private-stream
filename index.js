var crypto = require('crypto')
var pull = require('pull-stream')
var header = require('pull-header')
var peek = require('pull-peek')
var cipher = require('./cipher')

function genDH (mod, len) {
  /*
    generate a DH key that is not too short.
    I'm not really sure if this is the right way to do this,
    or why DH is sometimes not even. Without this,
    sometimes tests fail, and I don't want to use length delimiting
    so that all the bytes are random and it does not give away
    what cipher is being used.
  */
  var dh
  do {
    dh = crypto.getDiffieHellman(mod)
    dh.generateKeys()
  } while(dh.getPublicKey().length % 2)
  return dh
}

module.exports = function (dh, alg) {

  /*
    Default Settings - modp14 and aes-256-cbc

    reference: RFC 3526, http://www.rfc-editor.org/rfc/rfc3526.txt,
    (sha256-42fcef9cabf127b9f1fc310489bc42401c0a4f74e8f804c3c3fac9818fe240ed)

    A Diffie-Hellman group must be selected that is not weaker than
    the AES mode. RFC mentions that there where two disagreeing estimates
    of the relative strength of Diffie Hellman and AES,
    private-stream's defaults follow the advice of the more conservative estimate.

  */

  dh = dh || 'modp15'
  alg = alg || 'aes-128-cbc'
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


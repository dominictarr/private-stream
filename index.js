var pull = require('pull-stream')
var header = require('pull-header')
var peek = require('pull-peek')
var createStreamCipher = require('./cipher')
var createKeyExchange = require('./key-exchange')


/*
  Settings - modp14 and salsa20

  reference: RFC 3526, http://www.rfc-editor.org/rfc/rfc3526.txt,
  (sha256-42fcef9cabf127b9f1fc310489bc42401c0a4f74e8f804c3c3fac9818fe240ed)

  A Diffie-Hellman group must be selected that is not weaker than
  the AES mode. RFC mentions that there where two disagreeing estimates
  of the relative strength of Diffie Hellman and AES,
  private-stream's defaults follow the advice of the more conservative estimate.

  I have switched to using salsa20 by default, since it is a stream
  cipher it works well real-time data.
*/


module.exports = function (stream) {
  var encryptDH = createKeyExchange()
  var decryptDH = createKeyExchange()
  var l1 = encryptDH.getPublicKey().length
  var l2 = decryptDH.getPublicKey().length

  if(l1 != l2)
    throw new Error('mismatched lengths:'+l1 +' '+l2)

  var length = l1

  var encrypt = createStreamCipher()
  var decrypt = createStreamCipher()

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


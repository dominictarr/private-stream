var pull   = require('pull-stream')
var header = require('pull-header')
var peek   = require('pull-peek')
var crypto = require('crypto')

module.exports = function (KeyExchange, StreamCipher) {

  return function (stream) {
    var exchange = KeyExchange()
    var local    = exchange.getPublicKey()

    var localIV  = crypto.randomBytes(8)

    var encrypt  = StreamCipher()
    var decrypt  = StreamCipher()

    return {
      sink: pull(
        header(local.length + localIV.length, function (head) {
          var remote = head.slice(0, local.length)
          var remoteIV = head.slice(local.length, head.length)

          var secret = exchange.computeSecret(remote)
          decrypt.secret(secret, remoteIV)
          encrypt.secret(secret, localIV)
        }),
        peek(),
        decrypt,
        stream.sink
      ),
      source: pull(
        stream.source,
        encrypt,
        pull.prepend(Buffer.concat([local, localIV]))
      )
    }
  }
}

var pull   = require('pull-stream')
var header = require('pull-header')
var peek   = require('pull-peek')

module.exports = function (KeyExchange, StreamCipher, Hash) {

  return function (stream) {
    var exchange = KeyExchange()
    var local    = exchange.getPublicKey()

    var encrypt  = StreamCipher()
    var decrypt  = StreamCipher()

    function hash (a, b) {
      return Hash().update(a).update(b).digest()
    }

    return {
      sink: pull(
        header(local.length, function (remote) {
          var secret = exchange.computeSecret(remote)
          decrypt.secret(hash(remote, secret))
          encrypt.secret(hash(local, secret))
        }),
        peek(),
        decrypt,
        stream.sink
      ),
      source: pull(
        stream.source,
        encrypt,
        pull.prepend(local)
      )
    }
  }
}

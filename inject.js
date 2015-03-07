var pull               = require('pull-stream')
var header             = require('pull-header')
var peek               = require('pull-peek')

module.exports =
  function (createKeyExchange, createStreamCipher, createHash) {

    return function (stream) {
      var exchange = createKeyExchange()
      var local    = exchange.getPublicKey()

      var encrypt  = createStreamCipher()
      var decrypt  = createStreamCipher()

      function hash (a, b) {
        return createHash().update(a).update(b).digest()
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


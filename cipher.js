var defer = require('pull-defer/through')
var Salsa20 = require('salsa20')
var toPull = require('stream-to-pull-stream')

function salsa20 (secret, iv) {
  return toPull(Salsa20(secret, iv))
}

exports = module.exports = function (createStreamCipher, secret, iv) {
  createStreamCipher = createStreamCipher || salsa20

  if(secret) return createStreamCipher(secret, iv)

  var deferred = defer()
  deferred.secret = function (secret, iv) {
    deferred.resolve(createStreamCipher(secret, iv))
    return deferred
  }

  return deferred
}

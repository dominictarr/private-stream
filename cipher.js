var defer = require('pull-defer/through')
var Salsa20 = require('salsa20')
var toPull = require('stream-to-pull-stream')

function isString(s) {
  return 'string' === typeof s
}

// the iv is first 8 bytes of blake2s hash of 'private-stream'
// new Blake2s().update('private-stream').digest().slice(0, 8)
var iv = new Buffer('99ec6b50601492d0', 'hex')

function salsa20 (secret) {
  return toPull(Salsa20(secret, iv))
}

exports = module.exports = function (createStreamCipher, secret) {
  createStreamCipher = createStreamCipher || salsa20

  if(secret) return createStreamCipher(secret)

  var deferred = defer()
  deferred.secret = function (secret) {
    deferred.resolve(createStreamCipher(secret))
    return deferred
  }

  return deferred
}

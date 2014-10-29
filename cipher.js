var crypto = require('crypto')
var defer = require('pull-defer/through')
var through = require('pull-through')

function isString(s) {
  return 'string' === typeof s
}

exports = module.exports = function (alg, createCipher, secret) {
  alg = alg || 'aes-256-cbc'

  function stream (secret) {
    var cipher = createCipher(alg, secret)
    return through(function (data) {
        var _data = cipher.update(data, isString(data) ? 'utf8' : null)
        if(_data.length) this.queue(_data)
      }, function () {
        var _data = cipher.final()
        if(_data.length) this.queue(_data)
        this.queue(null)
      })

  }
  if(secret) return stream(secret)

  var deferred = defer()
  deferred.secret = function (secret) {
    deferred.resolve(stream(secret))
    return deferred
  }

  return deferred
}

exports.encrypt = exports.encipher = exports.cipher = function (alg, secret) {
  return exports(alg, crypto.createCipher, secret)
}

exports.decrypt = exports.decipher = function (alg, secret) {
  return exports(alg, crypto.createDecipher, secret)
}

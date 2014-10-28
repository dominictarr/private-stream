var handshake = require('pull-handshake')
var crypto = require('crypto')
var through = require('pull-through')
var pull = require('pull-stream')
var deferredThrough = require('./resume')
var header = require('./header')
var peek = require('./peek')
var cipher = require('./cipher')

function isString(s) {
  return 'string' === typeof s
}

var m = 0
module.exports = function (dh, alg) {

  dh = dh || 'modp5'
  alg = alg || 'aes-256-cbc'
  return function (stream) {
    var k = ++m
    console.log('wrapStream', k)
    var encrypt = crypto.getDiffieHellman(dh)
    var decrypt = crypto.getDiffieHellman(dh)

    encrypt.generateKeys()
    decrypt.generateKeys()

    var len = encrypt.getPublicKey().length
    var deferred = pull.defer()

    var decryptS, encryptS

    var sEncrypt = cipher.encrypt(alg)
    var sDecrypt = cipher.decrypt(alg)

    var keys = Buffer.concat([
          encrypt.getPublicKey(),
          decrypt.getPublicKey()
        ])

    var i = 0, j = 0

    var seen = {}

    return {
      sink: pull(
        header(len*2, function (head) {
          sDecrypt.secret(decrypt.computeSecret(head.slice(0, len)))
          sEncrypt.secret(encrypt.computeSecret(head.slice(len, len*2)))
        }),
        peek(),
        pull.through(function (data) {
          var d = data.toString('hex')
          console.log('W', k, ++j, data.length, data.toString('hex'))
          if(seen[d]) throw new Error('already seen data:' + d)
          seen[d] = true
        }),
        sDecrypt,
        stream.sink
      ),
      source:
        pull(
          stream.source,
          sEncrypt,
          pull.prepend(keys),
          pull.through(function (data) {
            console.log('R', k, ++i, data.length, data.toString('hex'))
          })
        )
    }
  }
}


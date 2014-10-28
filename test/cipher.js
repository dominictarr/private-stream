

var crypto = require('crypto')
var cipher = require('../cipher')
var pull = require('pull-stream')

var tape = require('tape')

tape('encrypt/decrypt', function (t) {

  var secret = crypto.createHash('sha256').update('whatever').digest()
  var encrypt = cipher.encrypt(null, secret)
  var decrypt = cipher.decrypt(null, secret)

  pull(
    pull.values(['hello there']),
    encrypt,
    decrypt,
    pull.map(String),
    pull.collect(function (err, ary) {
      var str = ary.join('')
      t.equal(str, 'hello there')
      t.end()
    })
  )

})

tape('encrypt/decrypt, delayed', function (t) {

  var secret = crypto.createHash('sha256').update('whatever').digest()
  var encrypt = cipher.encrypt()
  var decrypt = cipher.decrypt(null, secret)

  pull(
    pull.values(['hello there']),
    encrypt,
    decrypt,
    pull.map(String),
    pull.collect(function (err, ary) {
      var str = ary.join('')
      t.equal(str, 'hello there')
      t.end()
    })
  )

  encrypt.secret(secret)

})
tape('encrypt/decrypt, delayed', function (t) {

  var secret = crypto.createHash('sha256').update('whatever').digest()
  var encrypt = cipher.encrypt(null, secret)
  var decrypt = cipher.decrypt()

  pull(
    pull.values(['hello there']),
    encrypt,
    decrypt,
    pull.map(String),
    pull.collect(function (err, ary) {
      var str = ary.join('')
      t.equal(str, 'hello there')
      t.end()
    })
  )

  decrypt.secret(secret)

})

tape('encrypt/decrypt, delayed', function (t) {

  var secret = crypto.createHash('sha256').update('whatever').digest()
  var encrypt = cipher.encrypt()
  var decrypt = cipher.decrypt()

  pull(
    pull.values(['hello there']),
    encrypt,
    decrypt,
    pull.map(String),
    pull.collect(function (err, ary) {
      var str = ary.join('')
      t.equal(str, 'hello there')
      t.end()
    })
  )

  encrypt.secret(secret)
  decrypt.secret(secret)

})

tape('encrypt/decrypt, delayed', function (t) {

  var secret = crypto.createHash('sha256').update('whatever').digest()
  var encrypt = cipher.encrypt()
  var decrypt = cipher.decrypt()

  pull(
    pull.values(['hello there']),
    encrypt,
    decrypt,
    pull.map(String),
    pull.collect(function (err, ary) {
      var str = ary.join('')
      t.equal(str, 'hello there')
      t.end()
    })
  )

  decrypt.secret(secret)
  encrypt.secret(secret)

})


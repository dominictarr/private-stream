var crypto = require('crypto')
var cipher = require('../cipher')
var pull = require('pull-stream')
var random = require('pull-randomly-split')
var tape = require('tape')
var hexpp = require('hexpp')

var readme = require('fs').readFileSync(__dirname+'/../README.md')

tape('encrypt/decrypt', function (t) {

  var secret = crypto.createHash('sha256').update('whatever').digest()
  var encrypt = cipher(null, secret)
  var decrypt = cipher(null, secret)

  pull(
    pull.values(['hello there']),
//    pull.map(Buffer),
    encrypt,
    decrypt,
  //  pull.map(String),
    pull.collect(function (err, ary) {
      var str = ary.join('')
      t.equal(str, 'hello there')
      t.end()
    })
  )

})

tape('encrypt/decrypt, delayed', function (t) {

  var secret = crypto.createHash('sha256').update('whatever').digest()
  var encrypt = cipher()
  var decrypt = cipher(null, secret)

  pull(
    pull.values(['hello there']),
    pull.map(Buffer),
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
  var encrypt = cipher(null, secret)
  var decrypt = cipher()

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
  var encrypt = cipher()
  var decrypt = cipher()

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
  var encrypt = cipher()
  var decrypt = cipher()

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

for(var i = 0; i < 200; i++) (function (i) {
  tape('encrypt/decrypt - ' + i, function (t) {

    var secret = crypto.createHash('sha256').update('whatever' + i).digest()
    var encrypt = cipher()
    var decrypt = cipher()
    decrypt.secret(secret)
    encrypt.secret(secret)


    pull(
      pull.values([new Buffer('hello there what is going on')]),
      random(),
      encrypt,
      random(),
      decrypt,
      random(),
      pull.map(String),
      pull.collect(function (err, ary) {
        var str = ary.join('')
        t.equal(str, 'hello there what is going on')
        t.end()
      })
    )

  })
})(i)

for(var i = 0; i < 20; i++) (function (i) {
  tape('encrypt/decrypt readme file- ' + i, function (t) {

    var secret = crypto.createHash('sha256').update('whatever' + i).digest()
    var encrypt = cipher()
    var decrypt = cipher()
    decrypt.secret(secret)
    encrypt.secret(secret)

    pull(
      pull.values([readme]),
      random(),
      encrypt,
      pull.through(function (data) {
        console.log(hexpp(data, {ascii: true}))
      }),
      random(),
      decrypt,
      random(),
      pull.collect(function (err, ary) {
        var b = Buffer.concat(ary)
        t.deepEqual(b, readme)
        t.end()
      })
    )

  })
})(i)


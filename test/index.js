var pull = require('pull-stream')
var random = require('pull-randomly-split')
var tape = require('tape')

function stretch(msg) {
  var l = 10, a = []
  while(l--) a.push(msg)
  return a
}

function endpoint (messages, cb) {
  return {
    source: pull.values(messages),
    sink: pull(
      pull.map(String),
      pull.collect(function (err, ary) {
        console.log(ary)
        cb(err, ary && ary.join(''))
      })
    )
  }
}


function tests(mod, aes) {

  var private = require('../')(mod, aes) //use defaults.


  tape('encrypted duplex stream', function (t) {

    t.plan(2)

    var a = 'hello bob from alice'
    var b = 'hello alice from bob'
    var alice = endpoint([a], function (err, str) {
      console.log('alice recieved:', str)
      t.equal(str, b)
    })

    var bob = endpoint([b], function (err, str) {
      console.log('bob recieved:', str)
      t.equal(str, a)
    })

    var aliceCipher = private(alice)
    var bobCipher = private(bob)

    pull(
      bobCipher,
      aliceCipher,
      bobCipher
    )

  })

  for(var i = 0; i < 100; i++)
  tape('encrypted duplex stream - random buffers - ' + i, function (t) {

    t.plan(2)

    var a = 'hello bob from alice'
    var b = 'hello alice from bob'
    var alice = endpoint([a], function (err, str) {
      console.log('alice recieved:', str)
      t.equal(str, b)
    })

    var bob = endpoint([b], function (err, str) {
      console.log('bob recieved:', str)
      t.equal(str, a)
    })

    var aliceCipher = private(alice)
    var bobCipher = private(bob)

    pull(
      bobCipher,
    //  random(4, 32),
      aliceCipher,
  //    random(4, 32),
      bobCipher
    )

  })

}

tests('modp1', 'aes-128-cbc')
tests('modp2', 'aes-192-cbc')
tests('modp5', 'aes-256-cbc')
tests('modp14', 'aes-256-cbc')
tests('modp15', 'aes-128-cbc')


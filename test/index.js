var private = require('./')() //use defaults.
var pull = require('pull-stream')

function stretch(msg) {
  var l = 1, a = []
  while(l--) a.push(msg)
  return a
}

function endpoint (messages, cb) {
  return {
    source: pull.values(messages),
    sink: pull(
      pull.map(String),
      pull.collect(function (err, ary) {
        cb(err, ary && ary.join(''))
      })
    )
  }
}

var alice = endpoint(stretch('hello bob, from alice...'), function (err, ary) {
  console.log('alice recieved:', ary)
})

var bob = endpoint(stretch('hello alice, from bob!'), function (err, ary) {
  console.log('bob recieved:', ary)
})

var aliceCipher = private(alice)
var bobCipher = private(bob)

pull(aliceCipher, bobCipher, aliceCipher)


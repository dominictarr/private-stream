var pull  = require('pull-stream')
var tape  = require('tape')
var header = require('../header')
var crypto = require('crypto')
var split  = require('pull-randomly-split')

tape('grab the first N items from a stream', function (t) {
  var head
  pull(
    pull.values([new Buffer([1,2,3,4,5,6,7,8,9])]),
    header(3, function (a) {
      t.deepEqual(a, new Buffer([1,2,3]))
      head = a
    }),
    pull.collect(function (err, a) {
      t.deepEqual(Buffer.concat(a), new Buffer([4,5,6,7,8,9]))
      t.deepEqual(head, new Buffer([1,2,3]))
      t.end()
    })
  )
})

tape('end outer stream when there is an incomplete header', function (t) {

  pull(
    pull.values([new Buffer([1,2])]),
    header(3, function (a) {
      //header handler is not called if headers are incomplete.
      t.fail('should never happen')
    }),
    pull.collect(function (err, a) {
      t.ok(err)
      t.deepEqual(a, [])
      t.end()
    })
  )

})

for(var i = 1; i <= 20; i++)
  tape('shoud work with randomly split data ' + i, function (t) {
    var head = crypto.pseudoRandomBytes(256)
    var body = crypto.pseudoRandomBytes(1024)
    var _a

    pull(
      pull.values([head, body]),
      split(32, 512),
      header(256, function (a) {
        t.deepEqual(a, head)
        _a = a
      }),
      pull.collect(function (err, a) {
        t.deepEqual(Buffer.concat(a), body)
        t.deepEqual(_a, head)
        t.end()
      })
    )
  })

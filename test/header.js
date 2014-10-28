var pull  = require('pull-stream')
var tape  = require('tape')
var header = require('../header')
var crypto = require('crypto')
var split  = require('pull-randomly-split')
var cat = require('pull-cat')

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

for(var i = 1; i <= 1; i++)
  tape('shoud work with randomly split data ' + i, function (t) {
    var head = crypto.pseudoRandomBytes(256)
    var body = crypto.pseudoRandomBytes(1024)
    var _a

    pull(
      pull.values([head, body]),
//      split(32, 512),
      split(),
      header(256, function (a) {
        t.equal(a.length, head.length)
        t.deepEqual(a, head)
        _a = a
      }),
      pull.collect(function (err, a) {
        t.deepEqual(Buffer.concat(a), Buffer.concat([body]))
        t.deepEqual(_a, head)
        t.end()
      })
    )
  })

for(var i = 1; i <= 20; i++)
  tape('shoud work with randomly split data ' + i, function (t) {
    var head = crypto.pseudoRandomBytes(192)
    var body = crypto.pseudoRandomBytes(0)
    var _a

    pull(
      cat([
        pull.values([head]),
        function (abort, cb) {
          t.deepEqual(_a, head)
          t.end()
          
        }
      ]),
      split(),
      header(192, function (a) {
        t.deepEqual(a, head)
        _a = a
      }),
      pull.drain()
    )
  })


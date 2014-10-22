var pull = require('pull-stream')
var tape = require('tape')
var header = require('../header')

tape('grab the first N items from a stream', function (t) {
  var head
  pull(
    pull.values([1,2,3,4,5,6,7,8,9]),
    header(3, function (a) {
      t.deepEqual(a, [1,2,3])
      head = a
    }),
    pull.collect(function (err, a) {
      t.deepEqual(a, [4,5,6,7,8,9])
      t.deepEqual(head, [1,2,3])
      t.end()
    })
  )
})

tape('end outer stream when there is an incomplete header', function (t) {

  var called = false
  pull(
    pull.values([1,2]),
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

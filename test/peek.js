var pull = require('pull-stream')
var tape = require('tape')
var peek = require('../peek')

tape('peek ahead', function (t) {
  pull(
    pull.values([1,2,3,4,5]),
    peek(function (end, data) {
      console.log('first', end, data)
      t.equal(data, 1)
      t.end()
    })
  )
})

tape('peek ahead and passthrough', function (t) {
  var first
  pull(
    pull.values([1,2,3,4,5]),
    peek(function (end, data) {
      console.log('first', end, data)
      t.equal(data, 1)
      first = data
    }),
    pull.collect(function (err, ary) {
      if(err) throw err
      t.equal(first, 1)
      t.deepEqual(ary, [1,2,3,4,5])
      t.end()
    })
  )
})



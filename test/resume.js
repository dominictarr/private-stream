var tape = require('tape')
var pull = require('pull-stream')
var gate = require('../resume')
var peek = require('../peek')

tape('simple resolve after', function (t) {

  var g = gate()

  pull(
    pull.values([1,2,3,4,5]),
    g,
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, [5, 10, 15, 20, 25])
      t.end()
    })
  )

  g.resolve(pull.map(function (e) { return e * 5 }))

})

tape('simple resolve before', function (t) {

  var g = gate()
  g.resolve(pull.map(function (e) { return e * 5 }))

  pull(
    pull.values([1,2,3,4,5]),
    g,
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, [5, 10, 15, 20, 25])
      t.end()
    })
  )

})

tape('simple resolve mid', function (t) {

  var g = gate()

  var source = pull(pull.values([1,2,3,4,5]), g)

  g.resolve(pull.map(function (e) { return e * 5 }))

  pull(source,
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, [5, 10, 15, 20, 25])
      t.end()
    })
  )
})

tape('resolve after read', function (t) {
  var g = gate(), resolved = false

  pull(
    pull.values([1,2,3,4,5]),
    function (read) {
      return function (abort, cb) {
        read(abort, function (end, data) {
          if(!resolved) {
            resolved = true
            g.resolve(pull.map(function (e) { return e * 5 }))
          }
          cb(end, data)
        })
      }
    },
    //peek always reads the first item, before it has been called.
    peek(),
    g,
    pull.collect(function (err, ary) {
      if(err) throw err
      t.deepEqual(ary, [5, 10, 15, 20, 25])
      t.end()
    })
  )

})

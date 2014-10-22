

module.exports = function (n, onHeader) {
  var head = [], done = false
  return function (read) {
    return function (abort, cb) {
      read(abort, function next (end, data) {
        //when header is complete, become passthrough stream.
        if(done) return cb(end, data)

        //if the stream ends to early, abort the rest.
        if(end === true)
          return cb(new Error('stream ended before headers')) //pass an error?
        //if the stream errored, just pass that along.
        if(end) return cb(end)

        if(head.length < n) head.push(data)
        if(head.length == n) {
          done = true; onHeader(head)
        }
        read(null, next)
      })
    }
  }
}

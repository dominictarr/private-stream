

module.exports = function (length, onHeader) {
  var head = [], done = false, len = 0
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

        if(len < length) {
          head.push(data)
          len += data.length
        }
        if(len >= length) {
          var header = Buffer.concat(head)
          data = header.slice(length, header.length)
          header = header.slice(0, length)
          done = true; onHeader(header)
          if(data.length) return cb(null, data)
        }
        read(null, next)
      })
    }
  }
}

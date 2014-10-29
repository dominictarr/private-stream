# private-stream

Encrypt a duplex pull-stream, to add privacy. No integrety or identity is added.
The connection will be private, but checking _who_ you are connecting to is out of scope.

``` js
var private = require('private-stream')() //default settings

//aliceStream and bobStream must be DUPLEX pull streams
var alice = private(aliceStream)
var bob = private(bobStream)

pull(alice, bob, alice)

```

## License

MIT

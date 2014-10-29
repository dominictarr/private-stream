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

## API

``` js
//initialize createPrivateStream
//the settings passed are the default settings.
var createPrivateStream = require('private-stream')('modp15', 'aes-128-cbc')

//wrap a plain duplex stream to encrypt it.
var cipherDuplexStream = createPrivateStream(plainDuplexStream)
```

## Default Settings

reference: [RFC3526 
(sha256-42fcef9cabf127b9f1fc310489bc42401c0a4f74e8f804c3c3fac9818fe240ed)])(http://www.rfc-editor.org/rfc/rfc3526.txt)

A Diffie-Hellman group must be selected that is not weaker than
the AES mode. RFC mentions that there where two disagreeing estimates
of the relative strength of Diffie Hellman and AES,
private-stream's defaults follow the advice of the more conservative estimate.

According to that estimate, aes256 requires a very large DH key,
so the default security has been left at aes-128-cbc.

## License

MIT

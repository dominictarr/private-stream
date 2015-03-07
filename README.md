# private-stream

Encrypt a duplex pull-stream, to add privacy. No integrety or identity is added.
The connection will be private, but checking _who_ you are connecting to is out of scope.
Intended for use in p2p systems such as secure-scuttlebutt.

By design, there is no cipher suite negoiation handshake.
This is often a source of insecurity. p2p systems usually
have some out of band way to broadcast the addresses of other
peers in the system, this should also be used to broadcast the
ciphersuite.

This approach also has the advantage that all bytes transmitted
appear random, and forcing attackers to use more difficult methods
to identify the type of network traffic (timing and packet sizes)

# example

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
var createPrivateStream = require('private-stream')

//wrap a plain duplex stream to encrypt it.
var cipherDuplexStream = createPrivateStream(plainDuplexStream)
```

## mechanism

private-stream takes a key-exchange algorithm (diffie-helman with modp14)
and a stream cipher (salsa20 with initialization vector of first 8 bytes
of blake2s('private-stream') = 99ec6b50601492d0).
First the local sidegenerates 2 key exchanges, and sends them, the first
is the key they will use to encrypt, and the second is the key they will
use to decrypt. When the remote key exchanges have been received,
they are combined with the local key exchanges, so that the local encrypt
key is combined with the remote decrypt key, and the local decrypt key is combined with the remote encrypt key.

This means that the protocol is symmetric, and that a different key
is used for each encryption direction.

## known weaknesses

A man in the middle would be able to get the plaintext.

Since two separate key exchanges are computed per-side,
that costs more cpu than if it was only necessary to do one.

## Default Settings

reference: [RFC3526 
(sha256-42fcef9cabf127b9f1fc310489bc42401c0a4f74e8f804c3c3fac9818fe240ed)])(http://www.rfc-editor.org/rfc/rfc3526.txt)

A Diffie-Hellman group must be selected that is not weaker than
the AES mode. RFC mentions that there where two disagreeing estimates
of the relative strength of Diffie Hellman and AES,
private-stream's defaults follow the advice of the more conservative estimate.

The conservative strength estimate for diffie-helman with modp15 is 130 bits.

Since secure-scuttlebutt requires streaming realtime data,
I have decided to use salsa20 instead of aes.


## License

MIT

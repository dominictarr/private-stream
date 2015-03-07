# private-stream

Very simple encryption protocol for p2p systems.

Add privacy to a duplex pull-stream, but not integrety checking, or identity.
Intended for use in p2p systems such as [secure-scuttlebutt](https://github.com/ssbc)

There is no ciphersuite negoiation handshake.
This is by design, as it's often a source of complexity and insecurity.
p2p systems usually have a peer lookup system - usually a dht or gossip protocol -
that is used to discover temporary peer addresses.
Encryption protocols are also temporary, because weaknesses are found
or better algorithms are developed.
If the supported encryption configuration is also shared via the lookup system,
then it is not necessary to have a negotiation phase.

It's also possible to upgrade the protocol, without having
back-support for the negotation phase.
When a peer gains support for a better protocol,
they may update their public configuration,
listening with that protocol on a new port.
Once a sufficient members of the network have upgraded,
then peers can stop support for the old protocol.

Since a p2p system must be designed to accept nodes to become
unavailable, the network should continue to function even if
some peers drop support for a protocol before some peers upgrade,
as long as most nodes support both protocols.

Finally, by dropping the ciphersuite negotation phase,
all bytes transmitted appear random, forcing attackers to use more
difficult techniques to identify the type of network traffic.
(timing and packet sizes)

# Example

``` js
var private = require('private-stream')
var pull = require('pull-stream')

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

to use your own primitives, require the inject submodule
and pass it implementions of the 3 primitives.

``` js
var inject = require('private-stream/inject')

var private = inject(createKeyExchange, createStreamCipher, createHash)

private(stream) //encrypt a stream with your chosen primitives.
```

## Threat Model

This is intended to prevent passive eavesdroppers from being able
to observe the traffic in a peer to peer network. It is likely
that peers will need to share information somewhat freely with
other peers, so it will not prevent active attackers, but it will
force attackers to interact with the network, which at least
gives defensive peers the ability to know they are being observed.

## Mechanism

private-stream takes a key-exchange algorithm (diffie-helman with modp14)
a stream cipher (salsa20 with initialization vector of first 8 bytes
of blake2s('private-stream') = 99ec6b50601492d0), and a hash function (blake2s)

The protocol is symmetrical, and each side performs the same
operations in parallel, I'll call one side the "local" side, and one "remote",
but the caller and the answerer are both of local and remote to each other.

First the local side generates a key exchange, and sends it to the remote,
who has also done the same, and sent it to the local side.
Then On receiving the remote's key exchange, they are combined to compute
the secret.

We need two symmetrical keys, because stream cipher keys should not
be reused. To derive two secrets, we concatenate the secret with the public keys and hash them.

The local encryption key is `hash(local's exchange + secret)`
and the local decryption key is `hash(remote's exchange + secret)`.
This is symmetrical, so the local encryption key is the same as the remote
decryption key.

This uses two hashes, and one key exchange, which, for the default settings,
is cheaper than two key exchanges, allowing a more secure (expensive) key exchange.

## Known Weaknesses

* A man in the middle could access the plaintext.

* If either party had a random number generator that could be predicted
  by a third party, that party could access the plain text.
  (but if this is true they can probably guess their private key too)

## Cryptographic Primitives

reference: [RFC3526 
(sha256-42fcef9cabf127b9f1fc310489bc42401c0a4f74e8f804c3c3fac9818fe240ed)])(http://www.rfc-editor.org/rfc/rfc3526.txt)

A Diffie-Hellman group must be selected that is not weaker than
the AES mode. RFC mentions that there where two disagreeing estimates
of the relative strength of Diffie Hellman and AES,
private-stream's defaults follow the advice of the more conservative estimate.

The conservative strength estimate for diffie-helman with modp15 is 130 bits.

Since secure-scuttlebutt requires streaming realtime data,
and salsa20 is straightforward to implement securely,
I have decided to use salsa20 instead of aes.

## License

MIT

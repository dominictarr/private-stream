# private-stream

Very simple encryption protocol for p2p systems.

Add privacy to a duplex pull-stream, but not integrity checking, or identity.
Intended for use in p2p systems such as [secure-scuttlebutt](https://github.com/ssbc)

There is no cipher-suite negotiation handshake.
This is by design, as it's often a source of complexity and insecurity.
p2p systems usually have a peer lookup system - perhaps a DHT or gossip protocol -
that is used to discover temporary peer addresses.
Encryption protocols are also temporary, because weaknesses are found
or better algorithms are developed.
If the supported encryption configuration is also shared via the lookup system,
then it is not necessary to have a negotiation phase.

Even better, it's possible to upgrade the protocol, without having
to backwards-support the negotiation phase.
When a peer upgrades and supports a better protocol,
they update their public configuration,
listening with the new protocol on a new port.
Once sufficient members of the network have upgraded,
peers can deprecate the old protocol.

Since a p2p system must be designed to accept nodes to become
unavailable, the network should continue to function even if
some peers deprecate a protocol before some peers upgrade,
as long as most nodes support both protocols.

Without a cipher-suite negotiation phase,
all bytes transmitted appear random. This forces attackers to use more
difficult techniques to identify the type of network traffic
(such as packet timing and size).

Finally, since there is no negotiation phase, the implementation
can be very simple. The core part of the logic of the protocol is
less than 40 lines of javascript, not counting the implementations
of the primitives, or the libraries used to implement the streams, etc,
which are all rigorously tested else where, so code is highly auditable.

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
and pass it implementations of the 3 primitives.

``` js
var inject = require('private-stream/inject')

var private = inject(KeyExchange, StreamCipher, Hash)

private(stream) //encrypt a stream with your chosen primitives.
```

## Threat Model

`private-stream` is intended to prevent passive eavesdroppers
from being able to observe the traffic in a peer to peer network.
It is likely that peers will need to share information somewhat
freely with other peers, so this cannot prevent peers from maliciously
participating in the network, but by forcing surveillers to participate
in the network, at least defensive peers will have a chance to know
they are being observed.

## Mechanism

private-stream takes a key-exchange algorithm (diffie-helman with modp14)
a stream cipher (salsa20 with initialization vector of first 8 bytes
of blake2s('private-stream') = 99ec6b50601492d0),
and a hash function (blake2s)

The protocol is symmetrical, and each side performs the same
operations in parallel. I'll call one side the "local" side,
and one "remote", but the caller and the answerer are both of
local and remote to each other.

First the local side generates a key exchange, and sends it
to the remote, who has also done the same, sending it to the
local side. On receiving the remote's key exchange, they
are combined to compute the secret.

Stream cipher keys should not be reused, so we need two
symmetric keys. To derive two key, we concatenate the secret
with the public keys and hash them.

The local encryption key is `hash(local's exchange + secret)`
and the local decryption key is `hash(remote's exchange + secret)`.
This is symmetrical, so the local encryption key is the same
as the remote decryption key.

This uses two hashes, and one key exchange, which, for the
default settings, is cheaper than two key exchanges, allowing
a more secure (expensive) key exchange.

## Known Weaknesses

* A man in the middle could access the plaintext (a highly active attack)

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

Blake2s was chosen because it is the [fastest hash available implemented in javascript](http://dominictarr.github.io/crypto-bench/).

## License

MIT

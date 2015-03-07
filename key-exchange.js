var crypto = require('crypto')

module.exports = function (mod, len) {
  mod = mod || 'modp15'
  /*
    generate a DH key that is not too short.
    I'm not really sure if this is the right way to do this,
    or why DH is sometimes not even. Without this,
    sometimes tests fail, and I don't want to use length delimiting
    so that all the bytes are random and it does not give away
    what cipher is being used.
  */
  var dh
  do {
    dh = crypto.getDiffieHellman(mod)
    dh.generateKeys()
  } while(dh.getPublicKey().length % 2)

  return dh
}


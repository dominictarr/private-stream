
module.exports = require('./inject')(
  require('./key-exchange'),
  require('./cipher'),
  require('blake2s')
)

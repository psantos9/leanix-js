const Authenticator = require('../../dist').Authenticator
const lxr = require('../../lxr.json') // lxr.json must contain an object with "host" and "apitoken attributes set"

const authenticator = new Authenticator(...lxr)

authenticator.start()
  .then(() => {
    console.log('Auth Response', authenticator.authResponse)
    console.log(`Token will be renewed in ${authenticator.authResponse.expires_in} seconds`)
    authenticator.stop()
  })
  .catch(err => {
    console.error(`Got ${err.statusCode} from server!`)
  })

const Authenticator = require('../../dist').Authenticator
const lxr = require('../../lxr.json')

const authenticator = new Authenticator(lxr.instance, lxr.apiToken)

authenticator.start()
  .then(() => {
    console.log(`Auth Response`, authenticator.authResponse)
    console.log(`Token will be renewed in ${authenticator.authResponse.expires_in} seconds`)
    authenticator.stop()
  })
  .catch(err => {
    console.error(`Got ${err.statusCode} from server!`)
  })

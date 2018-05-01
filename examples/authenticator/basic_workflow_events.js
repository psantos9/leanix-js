const Authenticator = require('../../dist').Authenticator
const lxr = require('../lxr.json')

const authenticator = new Authenticator(lxr.instance, lxr.apiToken)

// authenticated event is thrown after a successfull authentication
authenticator.once('authenticated', () => {
  console.log(`Auth Response`, authenticator.authResponse)
  console.log(`Token will be renewed in ${authenticator.authResponse.expires_in} seconds`)
  authenticator.stop()
})

// 'error' event is thrown after an unsuccesfull authentication attempt
authenticator.on('error', err => {
  console.error(`Got ${err.statusCode} from server!`)
})

authenticator.start()
  // Catch promise rejection from start() in order to avoid unhandled rejection message in the console
  .catch(() => { })

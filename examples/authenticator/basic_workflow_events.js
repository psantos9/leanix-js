const Authenticator = require('../../dist').Authenticator

let authenticator

try {
  authenticator = new Authenticator()
} catch (err) {
  console.log('instantiating an authenticator agent without instance/apiToken parameters will throw an error')
}

authenticator = new Authenticator('app.leanix.net', '4kNXEDZtOrCxu5CrxJ7UP8rVZ2OUHz6jKp25CdZ5')

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

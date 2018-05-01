const Authenticator = require('../../dist').Authenticator

let authenticator
let timer

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
  // terminate the script execution
  clearInterval(timer)
})

// 'error' event is thrown after an unsuccesfull authentication attempt
authenticator.on('error', err => {
  console.error(`Got ${err.statusCode} from server!`)
  // terminate the script execution
  clearInterval(timer)
})

authenticator.start()
  // Catch promise rejection from start() in order to avoid unhandled rejection message in the console  
  .catch(err => { })

// Interval to prevent the script execution to end
timer = setInterval(() => {}, 5000)
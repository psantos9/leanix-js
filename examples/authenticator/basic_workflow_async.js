const Authenticator = require('../../dist').Authenticator

const authenticator = new Authenticator('app.leanix.net', '4kNXEDZtOrCxu5CrxJ7UP8rVZ2OUHz6jKp25CdZ5f')

const authenticate = async () => {
  try {
    await authenticator.start().catch(() => {})
    console.log(`Auth Response`, authenticator.authResponse)
    console.log(`Token will be renewed in ${authenticator.authResponse.expires_in} seconds`)
    authenticator.stop()
  } catch (err) {
    console.error(`Got ${err.statusCode} from server!`)
  }
}

authenticate()

const Authenticator = require('../../dist').Authenticator
const Metrics = require('../../dist').Metrics
const lxr = require('../../lxr.json')

const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
const metrics = new Metrics(authenticator)

authenticator.once('authenticated', () => {
  metrics.getMeasurements()
    .then(measurements => {
      const workspaceId = authenticator.authResponse.access_token_payload.principal.permission.workspaceId
      console.log(`Measurements for workspace ${workspaceId}`, measurements)
      // Terminate the authenticator job so that the program exits
      authenticator.stop()
    })
    .catch(err => {
      console.error('Error while getting measurements', err)
      authenticator.stop()
    })
})

authenticator.start()

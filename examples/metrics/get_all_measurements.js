const Authenticator = require('../../dist').Authenticator
const Metrics = require('../../dist').Metrics
const lxr = require('../../lxr.json')

const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
const metrics = new Metrics(authenticator)

authenticator.once('authenticated', () => {
  metrics.getMeasurements()
    .then(measurements => {
      console.log('measurements', measurements)
    })
    .catch(err => {
      console.error(err)
    })
})

authenticator.start()

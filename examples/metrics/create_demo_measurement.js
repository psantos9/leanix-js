const Authenticator = require('../../dist').Authenticator
const Metrics = require('../../dist').Metrics
const lxr = require('../../lxr.json')
const uuid = require('uuid')

const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
const metrics = new Metrics(authenticator)

authenticator.once('authenticated', async () => {
  const measurement = uuid.v4() // Measurement name
  const demoDataType = 'REVENUE' // Possible values are 'AVAILABILITY', 'NUMBEROFVISITORS' and 'REVENUE'
  const tag = {tagKey: 'factSheetType', tagValue: 'Application'} // Tag for the demo measurement
  try {
    await metrics.createDemoMeasurement(measurement, demoDataType, tag)
    console.log(`Demo measurement ${measurement} was created in workspace.`)
  } catch (err) {
    console.log(`Error while creating demo workspace`, err)
  }
  authenticator.stop()
})

authenticator.once('error', err => {
  console.error('Error while authenticating', err)
})

authenticator.start()

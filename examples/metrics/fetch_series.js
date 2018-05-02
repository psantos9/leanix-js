const Authenticator = require('../../dist').Authenticator
const Metrics = require('../../dist').Metrics
const lxr = require('../../lxr.json')
const uuid = require('uuid')

const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
const metrics = new Metrics(authenticator)

authenticator.once('authenticated', async () => {
  /*
   * Create a demo measurement in the workspace
   */
  const measurement = uuid.v4() // Demo measurement name
  const demoDataType = 'REVENUE' // Possible values are 'AVAILABILITY', 'NUMBEROFVISITORS' and 'REVENUE'
  try {
    await metrics.createDemoMeasurement(measurement, demoDataType)
    console.log(`Demo measurement ${measurement} was created in workspace.`)
  } catch (err) {
    console.log(`Error while creating demo workspace`, err)
    authenticator.stop()
    return
  }
  /*
   * Fetch a time series from the demo measurement
   */
  try {
    const series = await metrics.fetchSeries(`SELECT * from ${measurement}`)
    console.log(`Fetched series from workspace`, series)
  } catch (err) {
    console.log(`Error while fetching series from workspace`, err)
  }
  /*
   * Delete the demo measurement from the workspace
   */
  try {
    await metrics.deleteMeasurement(measurement)
    console.log(`Measurement ${measurement} was deleted from workspace.`)
  } catch (err) {
    console.log(`Error while deleting measurement ${measurement}`, err)
  }
  /*
   * Stop the authentication agent
   */
  authenticator.stop()
})

authenticator.once('error', err => {
  console.error('Error while authenticating', err)
})

/*
* Start the authentication agent
*/
authenticator.start()

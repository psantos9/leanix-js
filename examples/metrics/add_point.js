const Authenticator = require('../../dist').Authenticator
const Metrics = require('../../dist').Metrics
const lxr = require('../../lxr.json')

const getRandomInt = require('../../dist/helpers/random').getRandomInt
const getRandomFloat = require('../../dist/helpers/random').getRandomFloat

const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
const metrics = new Metrics(authenticator)

const addPoint = async () => {
  try {
    const measurement = 'testMeasurement'
    const fields = {users: getRandomInt(0, 100), availability: getRandomFloat(0, 100, 2)}
    const tags = {factSheetType: 'Application'}
    const timestamp = new Date().toISOString()
    const result = await metrics.addPoint(measurement, fields, tags, timestamp)
    console.log(`${result.time} ${result.workspaceId} - point added!`)
  } catch (err) {
    console.error(`Error while adding point`, err.message)
  }
}

// Add one random point to the test measurement and then stop
authenticator.once('authenticated', async () => {
  await addPoint()
  authenticator.stop()
})

authenticator.once('error', err => {
  console.error('Error while authenticating', err)
})

authenticator.start()

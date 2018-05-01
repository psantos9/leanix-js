const Authenticator = require('../../dist').Authenticator
const Metrics = require('../../dist').Metrics
const lxr = require('../../lxr.json')
const getRandomInt = require('../../dist/helpers/random').getRandomInt
const getRandomFloat = require('../../dist/helpers/random').getRandomFloat

const measurement = 'testMeasurement'

const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
const metrics = new Metrics(authenticator)

const addPoint = async () => {
  try {
    const users = getRandomInt(0, 100)
    const availability = getRandomFloat(0, 100, 2)
    const result = await metrics.addPoint(measurement, {users, availability}, {})
    console.log(`${result.time} ${result.workspaceId} - point added!`)
  } catch (err) {
    console.error(`Error while adding point`, err.message)
  }
}

// Add one random point to the test measurement and then stop
authenticator.once('authenticated', () => {
  addPoint()
  authenticator.stop()
})

authenticator.once('error', err => {
  console.error('Error while authenticating', err)
})

authenticator.start()

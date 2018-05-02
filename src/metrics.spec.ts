import 'mocha'
import { expect } from 'chai'
import * as uuid from 'uuid'
import Metrics from './metrics'
import Authenticator from './authenticator'

let lxr: { [k: string]: string } = {}

if (process.env.LEANIX_INSTANCE && process.env.LEANIX_API_TOKEN) {
  lxr = { instance: process.env.LEANIX_INSTANCE, apiToken: process.env.LEANIX_API_TOKEN }
} else {
  try {
    lxr = require('../lxr.json')
  } catch (err) { }
}

const sleep = async (delayMs: number): Promise<any> => {
  return new Promise((resolve, reject) => setTimeout(() => {
    resolve()
  }, delayMs))
}

describe('Metrics class', function () {
  // The default timeout
  this.timeout(10000)
  let authenticator: Authenticator
  let metrics: Metrics
  // Create a unique measurement name to be used for the test run
  let testMeasurementName = uuid.v4()
  // Create 10 different field sets to be used in the test point
  let testPointFields = Array.apply(null, Array(10))
    .reduce((accumulator: any, val: any) => {
      accumulator[uuid.v4()] = Object.keys.length
      return accumulator
    }, {})
  // Create a set of two test tags
  const testTags = { tag1: 'tag1', tag2: 'tag2' }
  // The reference timestamp for the test point
  const testTimestamp = new Date().toISOString()

  before(async () => {
    authenticator = new Authenticator(lxr.instance, lxr.apiToken)
    metrics = new Metrics(authenticator)
    await authenticator.start()
  })

  after(async () => await metrics.deleteMeasurement(testMeasurementName))

  it('should throw an error if an invalid authenticator is provided to the constructor', () => {
    expect(() => new Metrics(null)).to.throw(Error, 'provide an authenticator')
  })

  it('should list all measurements for a workspace', async () => {
    const measurements = await metrics.getMeasurements()
    expect(measurements).to.be.an('array')
  })

  it('should create the test point for the test measurement', async () => {
    const result = await metrics.addPoint(testMeasurementName, testPointFields, testTags, testTimestamp)
    expect(result.time).to.be.equal(testTimestamp)
    expect(result.fields).to.be.an('array')
    expect(Object.keys(testTags).length).to.be.equal(result.tags.length)
    expect(Object.keys(testPointFields).length).to.be.equal(result.fields.length)
  })

  it('should create and delete a specific measurement', async () => {
    const name = 'testMeasurement'
    let measurements = await metrics.getMeasurements()
    if (measurements.map(measurement => measurement.name).indexOf(name) > -1) {
      await metrics.deleteMeasurement(name)
      measurements = await metrics.getMeasurements()
      expect(measurements.map(measurement => measurement.name).indexOf(name)).lessThan(0)
    }
    // Check that test measurement name does not exist
    await metrics.addPoint(name, testPointFields, {})
    // Delay required for getting the correct measurements state after change
    await sleep(500)
    measurements = await metrics.getMeasurements()
    expect(measurements.map(measurement => measurement.name).indexOf(name)).greaterThan(-1)
    await metrics.deleteMeasurement(name)
    // Delay required for getting the correct measurements state after change
    await sleep(500)
    measurements = await metrics.getMeasurements()
    expect(measurements.map(measurement => measurement.name).indexOf(name)).lessThan(0)
  }).timeout(30000)

  it('should create a measurement with demo points', async () => {
    const measurement = uuid.v4()
    const demoDataType = 'AVAILABILITY'
    const tag = {tagKey: uuid.v4(), tagValue: uuid.v4()}
    await metrics.createDemoMeasurement(measurement, demoDataType, tag)
    const measurements = await metrics.getMeasurements()
    const measurementExistsInWorkspace = measurements.map(_measurement => _measurement.name).indexOf(measurement) > -1
    expect(measurementExistsInWorkspace).to.be.true
  })

  it('should delete all measurements for a workspace', async () => {
    const result = await metrics.deleteAllMeasurements()
    expect(result).to.be.undefined
  })

})

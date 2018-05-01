import 'mocha'
import { expect } from 'chai'
import Authenticator from './authenticator'

// Test variables defined either by lxr.json or envvars, usefull for CI pipelines
let lxr: {[k: string]: string} = { instance: process.env.LEANIX_INSTANCE, apiToken: process.env.LEANIX_API_TOKEN }
try {
  lxr = require('../lxr.json')
} catch (err) {}

console.log('lxr is ', lxr)
describe('Authenticator class', () => {

  it('should store the instance and apiToken variables passed to the constructor', () => {
    const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
    expect(authenticator.instance).to.equal(lxr.instance)
    expect(authenticator.hasCredentials).to.be.true
  })

  it('should start, authenticate successfully and stop', async () => {
    const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
    const token = await authenticator.start()
    expect(token).to.be.a('string')
    expect(authenticator.isRunning).to.be.true
    authenticator.stop()
    expect(authenticator.isRunning).to.be.false
    expect(authenticator.authResponse).to.be.undefined
    expect(authenticator.accessToken).to.be.undefined
  }).timeout(5000)

  it('should throw an "authenticated" event after a successfull authentication', done => {
    const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
    authenticator.on('authenticated', () => {
      expect(authenticator.isRunning).to.be.true
      expect(authenticator.accessToken).to.be.a('string')
      expect(authenticator.authResponse).not.to.be.undefined
      done()
    })
    authenticator.start()
  }).timeout(5000)

  it('should throw an "error" event after as unsuccessfull authentication', done => {
    const authenticator = new Authenticator(lxr.instance, 'invalidApiToken')
    authenticator.on('error', () => {
      expect(authenticator.isRunning).to.be.false
      expect(authenticator.accessToken).to.be.undefined
      expect(authenticator.authResponse).to.be.undefined
      done()
    })
    authenticator.start()
      // Ignore promise rejection, as the authentication error is reported by the "error" event
      .catch(err => { })
  }).timeout(5000)

})

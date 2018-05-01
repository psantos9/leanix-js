import 'mocha'
import { expect } from 'chai'
import Authenticator from './authenticator'

// Test variables defined either by lxr.json or envvars, usefull for CI pipelines
let lxr: {[k: string]: string} = { instance: process.env.LEANIX_INSTANCE, apiToken: process.env.LEANIX_API_TOKEN }
try {
  lxr = require('../lxr.json')
} catch (err) {}

describe('Authenticator class', () => {

  it('should store the instance and apiToken variables passed to the constructor', () => {
    const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
    expect(authenticator.instance).to.equal(lxr.instance)
    expect(authenticator.apiToken).to.equal(lxr.apiToken)
  })

  it('should authenticate successfully', async () => {
    const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
    const token = await authenticator.authenticate()
    expect(token).to.be.a('string')
  })

})

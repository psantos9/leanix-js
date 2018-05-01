import 'mocha'
import { expect } from 'chai'
import Authenticator from './authenticator'

// Test variables defined either by lxr.json or envvars, usefull for CI pipelines
let lxr: {[k: string]: string} = { instance: process.env.LEANIX_INSTANCE, apiToken: process.env.LEANIX_API_TOKEN }
try {
  lxr = require('../lxr.json')
} catch (err) {}

describe.skip('Authenticator class', () => {

  it('should start, authenticate successfully and stop', async () => {
    const authenticator = new Authenticator(lxr.instance, lxr.apiToken + 'd')
    const token = await authenticator.start().catch(err => {
      console.error(err)
    })
  }).timeout(5000)
})

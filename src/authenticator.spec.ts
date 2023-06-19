import Authenticator, { type ICredentials } from './authenticator'

let lxr: Record<string, string> = {}

if ((typeof process.env.LEANIX_HOST === 'string') && typeof process.env.LEANIX_API_TOKEN === 'string') {
  lxr = { host: process.env.LEANIX_HOST, apitoken: process.env.LEANIX_API_TOKEN }
} else {
  try {
    lxr = require('../lxr.json')
  } catch (err) {
    console.log(err)
  }
}

jest.setTimeout(30000)
describe('Authenticator class', () => {
  it('should store the instance and apitoken variables passed to the constructor', () => {
    const credentials: ICredentials = { host: lxr.host, apitoken: lxr.apitoken }
    const authenticator = new Authenticator(credentials)
    expect(authenticator.host).toEqual(lxr.host)
    expect(authenticator.hasCredentials).toBeTruthy()
    authenticator.stop()
  })

  it('should start, authenticate successfully and stop', async () => {
    const credentials: ICredentials = { host: lxr.host, apitoken: lxr.apitoken }
    const authenticator = new Authenticator(credentials)
    const token = await authenticator.start()
    expect(typeof token).toEqual('string')
    expect(authenticator.isRunning).toBeTruthy()
    expect(typeof authenticator.workspaceId).toEqual('string')
    expect(typeof authenticator.workspaceName).toEqual('string')
    authenticator.stop()
    expect(authenticator.isRunning).toBeFalsy()
    expect(authenticator.authResponse).toEqual(null)
    expect(authenticator.accessToken).toEqual(null)
    expect(authenticator.workspaceId).toEqual(null)
    expect(authenticator.workspaceName).toEqual(null)
  })

  it('should throw an "authenticated" event after a successfull authentication', done => {
    const credentials: ICredentials = { host: lxr.host, apitoken: lxr.apitoken }
    const authenticator = new Authenticator(credentials)
    authenticator.on('authenticated', () => {
      expect(authenticator.isRunning).toBeTruthy()
      expect(typeof authenticator.accessToken).toEqual('string')
      expect(typeof authenticator.authResponse).toEqual('object')
      authenticator.stop()
      done()
    })
    void authenticator.start()
  })

  it('should throw an "error" event after as unsuccessfull authentication', async () => {
    const invalidCredentials: ICredentials = { host: lxr.host, apitoken: 'invalidapitoken' }
    const authenticator = new Authenticator(invalidCredentials)
    await expect(authenticator.start()).rejects.toThrow('401 - unauthorized')
    expect(authenticator.isRunning).toBeFalsy()
    expect(authenticator.accessToken).toEqual(null)
    expect(authenticator.authResponse).toEqual(null)
    authenticator.stop()
  })
})

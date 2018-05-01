import 'mocha'
import { expect } from 'chai'
import { Authenticator, Metrics } from './index'

describe('LeanIX client library', () => {

  it('should export the Authenticator class', () => {
    expect(Authenticator).not.to.be.a('null')
  })

  it('should export the Metrics class', () => {
    expect(Metrics).not.to.be.a('null')
  })

})

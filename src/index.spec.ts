import 'mocha'
import { expect } from 'chai'
import { Authenticator, GraphQLClient, Metrics } from './index'

describe('LeanIX client library', () => {

  it('should export the Authenticator class', () => {
    expect(Authenticator).not.to.be.undefined
  })

  it('should export the GraphQLClient class', () => {
    expect(GraphQLClient).not.to.be.undefined
  })

  it('should export the Metrics class', () => {
    expect(Metrics).not.to.be.undefined
  })

})

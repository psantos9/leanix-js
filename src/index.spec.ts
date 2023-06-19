import { Authenticator, GraphQLClient } from './index'

describe('LeanIX client library', () => {
  it('should export the Authenticator class', () => {
    expect(Authenticator !== undefined).toBeTruthy()
  })

  it('should export the GraphQLClient class', () => {
    expect(GraphQLClient !== undefined).toBeTruthy()
  })
})

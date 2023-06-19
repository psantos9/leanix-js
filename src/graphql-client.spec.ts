import Authenticator, { type ICredentials } from './authenticator'
import GraphQLClient from './graphql-client'

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
describe('GraphQLClient class', function () {
  let authenticator: Authenticator
  let graphql: GraphQLClient

  beforeAll(async () => {
    const credentials: ICredentials = { host: lxr.host, apitoken: lxr.apitoken }
    authenticator = new Authenticator(credentials)
    graphql = new GraphQLClient(authenticator)
    await authenticator.start()
  })

  afterAll(async () => {
    authenticator.stop()
  })

  it('should make a query without variables', async () => {
    const query = '{allFactSheets{totalCount}}'
    const result = await graphql.executeGraphQL(query)
    expect((result?.allFactSheets?.totalCount ?? 0) > 0).toBeTruthy()
  })

  it('should throw a GraphQLError after an invalid query', async () => {
    const invalidQuery = '{invalidallFactSheets{totalCount}}'
    await expect(graphql.executeGraphQL(invalidQuery)).rejects.toThrowError()
  })

  it('should make a query with variables', async () => {
    const query = `
      query($first: Int) {
        allFactSheets(first: $first) {
          edges {
            node {
              id
            }
          }
        }
      }
    `
    const variables = { first: 1 }
    const result = await graphql.executeGraphQL(query, variables)
    expect('allFactSheets' in result).toBeTruthy()
    expect((result?.allFactSheets?.edges?.length ?? 0) === 1).toBeTruthy()
  })
})

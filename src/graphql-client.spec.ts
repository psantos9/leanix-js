import 'mocha'
import { expect } from 'chai'
import Authenticator from './authenticator'
import GraphQLClient from './graphql-client'

let lxr: { [k: string]: string } = {}

if (process.env.LEANIX_INSTANCE && process.env.LEANIX_API_TOKEN) {
  lxr = { instance: process.env.LEANIX_INSTANCE, apiToken: process.env.LEANIX_API_TOKEN }
} else {
  try {
    lxr = require('../lxr.json')
  } catch (err) { }
}

describe('GraphQLClient class', function () {
  this.timeout(10000)
  let authenticator: Authenticator
  let graphql: GraphQLClient

  before(async () => {
    authenticator = new Authenticator(lxr.instance, lxr.apiToken)
    graphql = new GraphQLClient(authenticator)
    await authenticator.start()
  })

  it('should make a query without variables', async () => {
    const query = `{allFactSheets{totalCount}}`
    const result = await graphql.run(query)
    expect(result).to.have.property('allFactSheets')
    expect(result.allFactSheets).to.have.property('totalCount')
    expect(result.allFactSheets.totalCount).to.be.greaterThan(1)
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
    const variables = {first: 1} 
    const result = await graphql.run(query, variables)
    expect(result).to.have.property('allFactSheets')
    expect(result.allFactSheets).to.have.property('edges')
    expect(result.allFactSheets.edges.length).to.be.equal(1)
  })

})

const Authenticator = require('../../dist').Authenticator
const GraphQLClient = require('../../dist').GraphQLClient
const lxr = require('../../lxr.json')

const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
const graphql = new GraphQLClient(authenticator)

authenticator.once('authenticated', async () => {
  const query = '{allFactSheets{totalCount}}'
  const result = await graphql.run(query)
  console.log(`There are ${result.allFactSheets.totalCount} factSheets in workspace ${authenticator.workspaceName}`)
  authenticator.stop()
})

authenticator.once('error', err => {
  console.error('Error while authenticating', err)
})

authenticator.start()

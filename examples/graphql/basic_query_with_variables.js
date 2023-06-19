const Authenticator = require('../../dist').Authenticator
const GraphQLClient = require('../../dist').GraphQLClient
const lxr = require('../../lxr.json') // lxr.json must contain an object with "host" and "apitoken attributes set"

const authenticator = new Authenticator(lxr.instance, lxr.apiToken)
const graphql = new GraphQLClient(authenticator)

authenticator.once('authenticated', async () => {
  const query = `
    query($first: Int) {
      allFactSheets(first: $first) {
        edges {
          node {
            id
            type
          }
        }
      }
    }
  `
  const variables = { first: 1 }
  const result = await graphql.executeGraphQL(query, variables)
  const factSheetType = result.allFactSheets.edges[0].node.type
  const factSheetId = result.allFactSheets.edges[0].node.id
  console.log(`The factsheet ${factSheetType} ${factSheetId} exists in workspace ${authenticator.workspaceName}`)
  authenticator.stop()
})

authenticator.once('error', err => {
  console.error('Error while authenticating', err)
})

authenticator.start()

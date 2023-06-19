import axios from 'axios'
import Authenticator from './authenticator'
import { GraphQLError } from './errors'

export default class GraphQLClient {
  private readonly _authenticator: Authenticator

  constructor (authenticator: Authenticator) {
    if (!(authenticator instanceof Authenticator)) throw Error('provide an authenticator')
    this._authenticator = authenticator
  }

  async executeGraphQL (query: string, variables?: any): Promise<any> {
    if (this._authenticator.accessToken === null) throw Error('not authenticated')
    const accessToken = this._authenticator.accessToken
    const host = this._authenticator.host
    const response = await axios.post(
      `https://${host}/services/pathfinder/v1/graphql`,
      { query, variables }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    ).then(({ data }) => {
      const { data: result = null, errors = null } = data
      if (errors !== null) throw new GraphQLError(JSON.stringify(errors))
      return result
    })
    return response
  }
}

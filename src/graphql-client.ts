import * as rp from 'request-promise-native'
import Authenticator from './authenticator'

export default class GraphQLClient {
  private _authenticator: Authenticator

  constructor(authenticator: Authenticator) {
    if (!authenticator) throw Error('provide an authenticator')
    this._authenticator = authenticator
  }

  executeGraphQL (query: string, variables?: any): Promise<any> {
    if (!this._authenticator.accessToken) throw Error(`not authenticated`)
    const accessToken = this._authenticator.accessToken
    const options = {
      method: 'POST',
      uri: `https://${this._authenticator.instance}/services/pathfinder/v1/graphql`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query, variables })
    }
    return rp({ ...options, proxy: this._authenticator.proxy })
      .then(res => JSON.parse(res))
      .then((res: Response) => {
        return res.errors && res.errors.length ? Promise.reject(res.errors) : res.data
      })
  }
}

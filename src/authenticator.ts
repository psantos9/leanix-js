import * as rp from 'request-promise-native'
import * as jwtDecode from 'jwt-decode'

interface AuthResponse {
  access_token: string
  access_token_payload: JWTPayload
  expired: boolean
  /** Token expiration time, in seconds */
  expires_in: number
  scope: string
  token_type: string
}

interface JWTPayload {
  exp: number
  jti: string
  principal: Principal
  sub: string
}

interface Principal {
  account: Account
  id: string
  permission: Permission
  role: string
  status: string
  username: string
}

interface Account {
  id: string
  name: string
}

interface Permission {
  customerRoles: string
  id: string
  role: string
  status: string
  workspaceId: string
  workspaceName: string
}

export default class Authenticator {
  private _authResponse: AuthResponse
  private _accessToken: string
  private _timer: NodeJS.Timer

  constructor (public instance: string, public apiToken: string, public proxy?: string) {}

  get accessToken (): string {
    return this._accessToken
  }

  get authResponse (): AuthResponse {
    return this._authResponse
  }

  public start () {
    return this.authenticate()
  }

  stop () {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = undefined
    }
  }

  status () {
    return this._timer ? 'RUNNING' : 'STOPPED'
  }

  authenticate () {
    this.stop()
    return new Promise((resolve, reject) => {
      this.getAccessToken(this.instance, this.apiToken, this.proxy)
        .then((authResponse: AuthResponse) => {
          this._authResponse = authResponse
          this._accessToken = authResponse.access_token
          if (authResponse.expired) throw new Error('received an expired jwt token')
          if (authResponse.expires_in > 0) {
            // Next authentication time, in milliseconds
            const nextAuth = Math.max(authResponse.expires_in - 10, 10) * 1000
            this._timer = setTimeout(() => this.authenticate(), nextAuth)
          }
          resolve(this._accessToken)
        })
        .catch(err => reject(err))
    })
  }

  getAccessToken (instance: string, apiToken: string, proxy?: string): Promise<AuthResponse> {
    const base64ApiToken = Buffer.from(`apitoken:${apiToken}`).toString('base64')
    const options = {
      method: 'POST',
      uri: `https://${instance}/services/mtm/v1/oauth2/token`,
      headers: {
        Authorization: `Basic ${base64ApiToken}`
      },
      form: {
        grant_type: `client_credentials`
      }
    }
    return rp({ ...options, proxy })
      .then((res: string) => {
        const authResponse: AuthResponse = JSON.parse(res)
        authResponse.access_token_payload = jwtDecode(authResponse.access_token)
        return authResponse
      })
  }
}

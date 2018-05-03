import * as rp from 'request-promise-native'
import * as jwtDecode from 'jwt-decode'
import * as EventEmitter from 'events'

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

export default class Authenticator extends EventEmitter {
  /**
   * Server response received from last authentication
   */
  private _authResponse: AuthResponse
  /**
   * Current JWT token
   */
  private _accessToken: string
  /**
   * NodeJS.Timer object for the token renewal job
   */
  private _timer: NodeJS.Timer

  constructor(public instance: string, private _apiToken: string, public proxy?: string) {
    super()
    if (!instance || !_apiToken) throw Error('instance and apiToken parameters are required')
  }

  get accessToken (): string {
    return this._accessToken
  }

  get authResponse (): AuthResponse {
    return this._authResponse
  }

  get workspaceId (): string {
    return this.isRunning ? this.authResponse.access_token_payload.principal.permission.workspaceId : undefined
  }

  get workspaceName (): string {
    return this.isRunning ? this.authResponse.access_token_payload.principal.permission.workspaceName : undefined
  }

  get hasCredentials(): boolean {
    return !!this._apiToken && !!this.instance
  }

  /**
   * Returns the running state of the authentication agent
   */
  get isRunning (): boolean {
    return !!this._timer
  }

  /**
   * Starts the authentication agent
   *
   * It should be inherited by all subclasses. This class has a static
   * member with the same name, both should be documented.
   *
   * @returns Return the name.
   */

  public start () {
    return this.authenticate()
  }

  /**
   * Stops the authentication agent
   */

  stop (): void {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = undefined
      this._accessToken = undefined
      this._authResponse = undefined
    }
  }

  private async authenticate () {
    this.stop()
    try {
      const authResponse: AuthResponse = await this.getAccessToken(this.instance, this._apiToken, this.proxy)
      this._authResponse = authResponse
      this._accessToken = authResponse.access_token
      if (authResponse.expired) throw new Error('received an expired jwt token')
      if (authResponse.expires_in > 0) {
        // Next authentication time, in milliseconds
        const nextAuth = Math.max(authResponse.expires_in - 10, 10) * 1000
        this._timer = setTimeout(() => this.authenticate(), nextAuth)
      }
      this.emit('authenticated')
      return this._accessToken
    } catch (err) {
      this.stop()
      this.emit('error', err)
      return err
    }
  }

  private getAccessToken (instance: string, apiToken: string, proxy?: string): Promise<AuthResponse> {
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

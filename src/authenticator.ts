import axios, { AxiosError } from 'axios'
import jwtDecode from 'jwt-decode'
import * as EventEmitter from 'events'
import { UnauthorizedError } from './errors'
export interface AuthResponse {
  access_token: string
  access_token_payload: JWTPayload
  expired: boolean
  /** Token expiration time, in seconds */
  expires_in: number
  scope: string
  token_type: string
}

export interface JWTPayload {
  exp: number
  jti: string
  principal: Principal
  sub: string
}

export interface Principal {
  account: Account
  id: string
  permission: Permission
  role: string
  status: string
  username: string
}

export interface Account {
  id: string
  name: string
}

export interface Permission {
  customerRoles: string
  id: string
  role: string
  status: string
  workspaceId: string
  workspaceName: string
}

export interface ICredentials {
  host: string
  apitoken: string
}

export default class Authenticator extends EventEmitter {
  /**
   * Server response received from last authentication
   */
  private _authResponse: AuthResponse | null = null
  /**
   * Current JWT token
   */
  private _accessToken: string | null = null
  /**
   * NodeJS.Timer object for the token renewal job
   */
  private _timer: NodeJS.Timer | null = null

  private readonly _host: string
  private readonly _apitoken: string

  constructor (credentials: ICredentials, public proxy?: string) {
    super()
    if (typeof credentials !== 'object' || credentials === null || typeof credentials.host !== 'string' || typeof credentials.apitoken !== 'string') throw Error('host and apitoken parameters are required')
    this._host = credentials.host
    this._apitoken = credentials.apitoken
  }

  get host (): string {
    return this._host
  }

  get apitoken (): string {
    return this._apitoken
  }

  get accessToken (): string | null {
    return this._accessToken
  }

  get authResponse (): AuthResponse | null {
    return this._authResponse
  }

  get workspaceId (): string | null {
    return this.authResponse?.access_token_payload?.principal?.permission.workspaceId ?? null
  }

  get workspaceName (): string | null {
    return this.authResponse?.access_token_payload?.principal?.permission?.workspaceName ?? null
  }

  get hasCredentials (): boolean {
    return typeof this.apitoken === 'string' && typeof this.host === 'string'
  }

  /**
   * Returns the running state of the authentication agent
   */
  get isRunning (): boolean {
    return this._timer !== null
  }

  /**
   * Starts the authentication agent
   *
   * It should be inherited by all subclasses. This class has a static
   * member with the same name, both should be documented.
   *
   */

  public async start (): Promise<string> {
    const token = await this.authenticate()
    return token
  }

  /**
   * Stops the authentication agent
   */

  stop (): void {
    if (this._timer !== null) {
      clearTimeout(this._timer)
      this._timer = null
      this._accessToken = null
      this._authResponse = null
    }
  }

  private async authenticate (): Promise<string> {
    this.stop()
    try {
      const authResponse: AuthResponse = await this.getAccessToken(this.host, this._apitoken, this.proxy)
      this._authResponse = authResponse
      this._accessToken = authResponse.access_token
      if (authResponse.expired) throw new Error('received an expired jwt token')
      if (authResponse.expires_in > 0) {
        // Next authentication time, in milliseconds
        const nextAuth = Math.max(authResponse.expires_in - 10, 10) * 1000
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this._timer = setTimeout(async () => await this.authenticate(), nextAuth)
      }
      this.emit('authenticated')
      return this._accessToken
    } catch (err) {
      this.stop()
      this.emit('error', err)
      throw err
    }
  }

  private async getAccessToken (host: string, apiToken: string, proxy?: string): Promise<AuthResponse> {
    const base64ApiToken = Buffer.from(`apitoken:${apiToken}`).toString('base64')

    const authResponse = await axios.post(`https://${host}/services/mtm/v1/oauth2/token`, new URLSearchParams({ grant_type: 'client_credentials' }), {
      headers: {
        Authorization: `Basic ${base64ApiToken}`
      }
    }).then(({ data }) => data as AuthResponse)
      .catch(err => {
        if (err instanceof AxiosError) {
          if (err?.response?.status === 401) throw new UnauthorizedError()
        }
        throw err
      })
    authResponse.access_token_payload = jwtDecode(authResponse.access_token)
    return authResponse
  }
}

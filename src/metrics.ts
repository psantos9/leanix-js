import * as qs from 'querystring'
import * as rp from 'request-promise-native'
import * as jwtDecode from 'jwt-decode'
import Authenticator from './authenticator'

export default class Metrics {

  private _authenticator: Authenticator

  constructor(authenticator: Authenticator) {
    if (!authenticator) throw Error('provide an authenticator')
    this._authenticator = authenticator
  }

  getMeasurements (): Promise<Array<Measurement>> {
    if (!this._authenticator.accessToken) throw Error(`not authenticated`)
    const accessToken = this._authenticator.accessToken
    const workspaceId = this._authenticator.authResponse.access_token_payload.principal.permission.workspaceId
    const options = {
      method: 'GET',
      uri: `https://${this._authenticator.instance}/services/metrics/v1/measurements?${qs.stringify({ workspaceId })}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
    return rp({ ...options, proxy: this._authenticator.proxy })
      .then(res => JSON.parse(res))
      .then((res: Response) => {
        return res.errors.length ? Promise.reject(res.errors) : res.data
      })
  }

  deleteMeasurement (name: string): Promise<Measurement> {
    if (!this._authenticator.accessToken) throw Error(`not authenticated`)
    else if (!name) throw new Error(`please provide a measurement name`)
    const accessToken = this._authenticator.accessToken
    const workspaceId = this._authenticator.authResponse.access_token_payload.principal.permission.workspaceId
    const options = {
      method: 'DELETE',
      uri: `https://${this._authenticator.instance}/services/metrics/v1/measurements/${name}?${qs.stringify({ workspaceId })}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
    return rp({ ...options, proxy: this._authenticator.proxy })
      .then(res => JSON.parse(res))
      .then((res: Response) => res.errors.length ? Promise.reject(res.errors) : res.data)
  }

  deleteAllMeasurements(): Promise<void> {
    if (!this._authenticator.accessToken) throw Error(`not authenticated`)
    const accessToken = this._authenticator.accessToken
    const workspaceId = this._authenticator.authResponse.access_token_payload.principal.permission.workspaceId
    const options = {
      method: 'DELETE',
      uri: `https://${this._authenticator.instance}/services/metrics/v1/workspaces/${workspaceId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
    return rp({ ...options, proxy: this._authenticator.proxy })
      .then(res => JSON.parse(res))
      .then((res: Response) => res.errors.length ? Promise.reject(res.errors) : Promise.resolve())
  }

  addPoint (measurement: string, fields: { [k: string]: number }, tags: { [k: string]: string }, time?: string): any {
    if (!time) time = new Date().toISOString()
    if (!this._authenticator.accessToken) throw new Error(`not authenticated`)
    const _fields = Object.keys(fields)
      .map(k => { return { k, v: fields[k] }})
    const _tags = Object.keys(tags)
      .map(k => { return { k, v: tags[k] }})
    const accessToken = this._authenticator.accessToken
    const workspaceId = this._authenticator.authResponse.access_token_payload.principal.permission.workspaceId
    const options = {
      method: 'POST',
      uri: `https://${this._authenticator.instance}/services/metrics/v1/points`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ measurement, workspaceId, time, tags: _tags, fields: _fields })
    }
    return rp({ ...options, proxy: this._authenticator.proxy })
      .then(res => JSON.parse(res))
      .then((res: Response) => {
        return res.errors.length ? Promise.reject(res.errors) : res.data
      })
  }

  fetchData (q: string, raw?: boolean): Promise<any> {
    const accessToken = this._authenticator.accessToken
    const workspaceId = this._authenticator.authResponse.access_token_payload.principal.permission.workspaceId
    const options = {
      method: 'GET',
      uri: `https://${this._authenticator.instance}/services/metrics/v1/series${raw ? '/raw' : ''}?${qs.stringify({ workspaceId, q })}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
    return rp({ ...options, proxy: this._authenticator.proxy })
      .then(res => JSON.parse(res))
      .then((res: Response) => {
        return !raw && res.errors.length ? Promise.reject(res.errors) : raw ? res : !res.data ? Promise.reject('no data found') : res.data
      })
  }

}

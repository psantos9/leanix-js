export class UnauthorizedError extends Error {
  constructor () {
    super('401 - unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export class GraphQLError extends Error {
  constructor (errors: any) {
    super(JSON.stringify(errors))
    this.name = 'GraphQLError'
  }
}

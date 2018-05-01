interface Response {
  status: string
  errors: Array<ErrorEntry>
  data: any
  total: number
}

interface ErrorEntry {
  value: string
  messages: Array<string>
}

interface Measurement {
  name: string
  fields: Array<string>
  tags: Array<string>
}

interface Field {
  k: string
  v: string | number
}

interface Tag {
  k: string
  v: string
}

interface Values {
  t: string
  v: Array<number>
}

interface Series {
  name: string
  fields: Array<string>
  values: Array<Values>
}

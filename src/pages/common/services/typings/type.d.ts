declare namespace API_PostDeviceSelectOptions {
  export interface Result {
    err: number
    msg: string
    res: Items
  }

  export interface Items {
    id: number
    name: string
    ip: string
  }
}

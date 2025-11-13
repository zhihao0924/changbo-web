declare namespace API_PostAdminList {
  export interface Result {
    err: number
    msg: string
    res: Res
  }

  export interface Res {
    has_more: number
    next_page: number
    total: number
    list: List[]
  }

  export interface List {
    id: number
    account: string
    name: string
    role: string
    email: string
    is_disabled: boolean
  }
}

declare namespace API_PostAdminCreate {
  export interface Result {
    err: number
    msg: string
    res: any
  }
}
declare namespace API_PostAdminResetPwd {
  export interface Result {
    err: number
    msg: string
    res: any
  }
}

declare namespace API_PostAdminDisabled {
  export interface Result {
    err: number
    msg: string
    res: any
  }
}

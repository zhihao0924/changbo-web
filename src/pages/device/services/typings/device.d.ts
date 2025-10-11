declare namespace API_PostDeviceList {
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
    ip: string
    name: string
    position: string
    type: string
    status: bigint
    status_text: string
    temperature: number
    current: number
    voltage: number
    is_maintaining: boolean
    configs: Configs[]
  }

  export interface Configs {
    config_type: number
    config_type_name: string
    filter_operator: string
    val: number
    unit: string
    sort: number
  }
}

declare namespace API_PostDeviceCreate {
  export interface Result {
    err: number
    msg: string
    res: Res
  }

  export interface Res {}
}
declare namespace API_PostDeviceUpdate {
  export interface Result {
    err: number
    msg: string
    res: Res
  }

  export interface Res {}
}

declare namespace API_PostToggleMaintaining {
  export interface Result {
    err: number
    msg: string
    res: Res
  }

  export interface Res {}
}

declare namespace API_PostDeviceTypes {
  export interface Result {
    err: number
    msg: string
    res: Res
  }

  export interface Res {
    list: List[]
    total: number
  }

  export interface List {
    key: string
    value: string
  }
}

declare namespace API_PostTopologyData {
  export interface Result {
    err: number
    msg: string
    res: {
      nodes: Nodes[]
      edges: Edges[]
    }
  }
  export interface Nodes {
    id: string
    name: string
    type: string
    status: number
  }

  export interface Edges {
    source: string
    target: string
    relation: string
  }
}

declare namespace API_PostDeviceTypeSave {
  export interface Result {
    err: number
    msg: string
    res: any
  }
}

declare namespace API_PostDeviceTypeConfigSaveData {
  export interface Result {
    err: number
    msg: string
    res: any
  }
}

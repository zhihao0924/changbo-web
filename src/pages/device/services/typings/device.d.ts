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
    device_type_group: string
    device_type_id: number
    device_type: string
    device_type_alias: string
    status: bigint
    status_text: string
    tag_color: string
    is_maintaining: boolean
    is_online: boolean
    metric_items: MetricItems[]
    alarm_items: AlarmItems[]
  }

  export interface MetricItems {
    //
    config_type: number
    config_type_name: string
    current_val: number | undefined
    min_val: number | undefined
    max_val: number | undefined
    show_in_list: string
    show_in_detail: string
    unit: string
    threshold_val: number
  }
  export interface AlarmItems {
    config_type: number
    config_type_name: string
    current_val: number
    is_alarm: boolean
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
    id: number
    device_type_group: string
    device_type: string
    device_type_alias: string
    configs: Configs[]
    alarms: Alarms[]
    shows: Shows[]
  }
  export interface Configs {
    config_type: number
    config_type_name: string
    alarm_operator: string
    val: number
    min: number
    max: number
    unit: string
    sort: number
  }
  export interface Alarms {
    config_type: number
    config_type_name: string
    is_selected: boolean
  }
  export interface Shows {
    config_type: number
    config_type_name: string
    is_show_in_list: boolean
    is_show_in_detail: boolean
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
declare namespace API_PostSaveTopologyData {
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

declare namespace API_PostDeviceTypeAlarmSaveData {
  export interface Result {
    err: number
    msg: string
    res: any
  }
}

declare namespace API_PostDeviceTypeShowSaveData {
  export interface Result {
    err: number
    msg: string
    res: any
  }
}

declare namespace API_PostLogList {
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
    content: string
    created_at: string
  }
}

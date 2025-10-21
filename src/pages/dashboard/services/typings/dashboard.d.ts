declare namespace API_PostDashboard {
  export interface Result {
    err: number
    msg: string
    res: Result
  }
  export interface Result {
    total: number
    statistic: Statistic
    energy_consumption: Statistic
    total_healthy: number
    type_statistic: StatisticNumber
    alarm_device: AlarmDevice[]
  }

  export interface Statistic {
    type: string
    value: number
    sort: number
  }

  export interface StatisticNumber {
    name: string
    total_num: number
    online_num: number
    offline_num: number
    alarm_num: number
  }
  export interface AlarmDevice {
    alarm_at: string
    alarm_at_str: string
    alarm_item: any[]
    alarm_txt: string
    device_id: number
    device_type: string
    device_type_group: string
    suggested_action: string
  }
}

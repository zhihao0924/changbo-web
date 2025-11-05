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
    type_statistic: StatisticNumber[]
    alarm_device: AlarmDevice[]
    transmitter_mixer_downlink_forward_power_signal: boolean // 合路器下行正向
    near_end_bs1_downlink_input_power_signal: boolean //近端机BS1下行输入
    near_end_bs1_uplink_output_rssi_signal: boolean // 近端机BS1上行输出RSSI值
    splitter_rx_output_rssi_signal: boolean // 分路器RX上行输出RSSI值
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
    maintaining_num: number
  }
  export interface AlarmDevice {
    alarm_item: AlarmItem
    device_id: number
    device_name: string
    device_type: string
    device_type_group: string
    alarm_at: string
  }

  export interface AlarmItem {
    config_type: number
    config_type_name: string
    alarm_text: string
    suggested_action: string
  }
}

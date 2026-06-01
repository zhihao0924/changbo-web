export type MessageValues = Record<string, string | number>

export type BackendMessageParams = Record<string, string | number | boolean | null | undefined>

export type BackendI18nPayload = {
  key?: string | null
  code?: string | null
  params?: BackendMessageParams | null
  fallback?: string | null
  defaultMessage?: string | null
  value?: string | null
}

export type BackendI18nValue = string | BackendI18nPayload | null | undefined

export type BackendKeyedValue = {
  key?: string | null
  code?: string | null
  params?: BackendMessageParams | null
  fallback?: string | null
}

export type Translate = (id: string, defaultMessage: string, values?: MessageValues) => string

export const DEFAULT_LOCALE = "en-US"
export const LOCALE_STORAGE_KEY = "umi_locale"
export const I18N_ENABLED = process.env.I18N_ENABLED === true || process.env.I18N_ENABLED === "true"
export const SUPPORTED_LOCALES = ["en-US", "zh-CN"] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const BASE_LOCALE: SupportedLocale = SUPPORTED_LOCALES.includes(
  process.env.BASE_LOCALE as SupportedLocale,
)
  ? (process.env.BASE_LOCALE as SupportedLocale)
  : DEFAULT_LOCALE
export const DEFAULT_SYSTEM_NAME_EN = "Private Network Communication Intelligent NMS"
export const DEFAULT_SYSTEM_NAME_ZH = "专网通信智能网管平台"
const DEFAULT_SYSTEM_NAME_VALUES = new Set([
  DEFAULT_SYSTEM_NAME_EN.toLowerCase(),
  DEFAULT_SYSTEM_NAME_ZH,
])

const RUNTIME_MESSAGES: Record<string, Record<string, string>> = {
  "en-US": {
    "app.system.defaultName": "Private Network Communication Intelligent NMS",
    "app.common.refresh": "Refresh",
    "app.common.requesting": "Loading...",
    "app.common.deleteSuccess": "Deleted successfully",
    "app.common.saveSuccess": "Saved successfully",
    "app.common.serviceError": "Service error",
    "app.common.unknownError": "Unknown error",
    "app.common.tokenExpired": "Token expired. Please sign in again.",
    "app.dashboard.action.pleaseContactAdministrator": "Please contact the administrator",
    "app.global.offline": "You are offline",
    "app.global.updateAvailable": "New content available",
    "app.global.updateDescription": "Click Refresh or reload the page manually.",
    "app.version.updateTitle": "Updated to v${version}",
  },
  "zh-CN": {
    "app.system.defaultName": "专网通信智能网管平台",
    "app.common.refresh": "刷新",
    "app.common.requesting": "数据请求中...",
    "app.common.deleteSuccess": "删除成功",
    "app.common.saveSuccess": "保存成功",
    "app.common.serviceError": "服务错误",
    "app.common.unknownError": "未知错误",
    "app.common.tokenExpired": "token失效，请重新登陆！",
    "app.dashboard.action.pleaseContactAdministrator": "请联系管理员",
    "app.global.offline": "当前处于离线状态",
    "app.global.updateAvailable": "有新内容",
    "app.global.updateDescription": "请点击“刷新”按钮或者手动刷新页面",
    "app.version.updateTitle": "更新v${version}版本",
  },
}

const BACKEND_LABEL_KEYS: Record<string, [string, string]> = {
  mixer: ["app.device.index.group.transmitterMixer", "Transmitter Mixer"],
  receiver: ["app.device.index.group.receiverSplitter", "Receiver Splitter"],
  splitter: ["app.device.index.group.receiverSplitter", "Receiver Splitter"],
  "near-end": ["app.device.index.group.nearEnd", "Near-end Unit"],
  remote: ["app.device.index.group.remote", "Remote Unit"],
  total: ["app.dashboard.total", "Total"],
  healthy: ["app.dashboard.healthy", "Healthy"],
  unhealthy: ["app.dashboard.unhealthy", "Unhealthy"],
  today: ["app.dashboard.time.today", "Today"],
  day: ["app.dashboard.time.today", "Today"],
  daily: ["app.dashboard.time.today", "Today"],
  yesterday: ["app.dashboard.time.yesterday", "Yesterday"],
  week: ["app.dashboard.time.thisWeek", "This Week"],
  weekly: ["app.dashboard.time.thisWeek", "This Week"],
  month: ["app.dashboard.time.thisMonth", "This Month"],
  monthly: ["app.dashboard.time.thisMonth", "This Month"],
  year: ["app.dashboard.time.thisYear", "This Year"],
  yearly: ["app.dashboard.time.thisYear", "This Year"],
  rx: ["app.device.libiio.module.rx", "RX Module"],
  tx: ["app.device.libiio.module.tx", "TX Module"],
  frequency: ["app.device.libiio.board.frequency", "Frequency"],
  power: ["app.device.libiio.board.power", "Power"],
  rssi: ["app.device.libiio.rxRssi", "RX RSSI"],
  hardwaregain: ["app.device.libiio.rxHardwareGainDb", "Hardware Gain (dB)"],
  online: ["app.device.status.online", "Online"],
  offline: ["app.device.status.offline", "Offline"],
  alarm: ["app.dashboard.alarm", "Alarm"],
  maintaining: ["app.device.index.maintaining", "Maintaining"],
  normal: ["app.device.libiio.board.statusNormal", "Normal"],
  abnormal: ["app.device.libiio.board.statusAbnormal", "Abnormal"],
  high: ["app.device.libiio.board.statusHigh", "High"],
  low: ["app.device.libiio.board.statusLow", "Low"],
}

const BACKEND_CODE_KEYS: Record<string, [string, string]> = {
  "message.deleted_successfully": ["app.common.deleteSuccess", "Deleted successfully"],
  "message.saved_successfully": ["app.common.saveSuccess", "Saved successfully"],
  "message.please_contact_the_administrator": [
    "app.dashboard.action.pleaseContactAdministrator",
    "Please contact the administrator",
  ],
  "dashboard.total": ["app.dashboard.total", "Total"],
  "dashboard.deviceTotal": ["app.dashboard.deviceTotal", "Total Devices"],
  "dashboard.healthRate": ["app.dashboard.healthRate", "Health Rate"],
  "dashboard.stat.total": ["app.dashboard.total", "Total"],
  "dashboard.stat.online": ["app.dashboard.online", "Online"],
  "dashboard.stat.offline": ["app.dashboard.offline", "Offline"],
  "dashboard.stat.alarm": ["app.dashboard.alarm", "Alarm"],
  "dashboard.stat.healthy": ["app.dashboard.healthy", "Healthy"],
  "dashboard.stat.unhealthy": ["app.dashboard.unhealthy", "Unhealthy"],
  "dashboard.healthy": ["app.dashboard.healthy", "Healthy"],
  "dashboard.unhealthy": ["app.dashboard.unhealthy", "Unhealthy"],
  "dashboard.online": ["app.dashboard.online", "Online"],
  "dashboard.offline": ["app.dashboard.offline", "Offline"],
  "dashboard.onlineDevices": ["app.dashboard.onlineDevices", "Online Devices"],
  "dashboard.offlineDevices": ["app.dashboard.offlineDevices", "Offline Devices"],
  "dashboard.alarmDevices": ["app.dashboard.alarmDevices", "Alarm Devices"],
  "dashboard.healthyDevices": ["app.dashboard.healthyDevices", "Healthy Devices"],
  "dashboard.unhealthyDevices": ["app.dashboard.unhealthyDevices", "Unhealthy Devices"],
  "dashboard.maintainingDevices": ["app.dashboard.maintainingDevices", "Maintaining Devices"],
  "dashboard.time.today": ["app.dashboard.time.today", "Today"],
  "dashboard.time.yesterday": ["app.dashboard.time.yesterday", "Yesterday"],
  "dashboard.time.thisWeek": ["app.dashboard.time.thisWeek", "This Week"],
  "dashboard.time.thisMonth": ["app.dashboard.time.thisMonth", "This Month"],
  "dashboard.time.thisYear": ["app.dashboard.time.thisYear", "This Year"],
  "dashboard.alarmItem.transmitterMixerDownlinkForwardPowerSignal": [
    "app.dashboard.alarmItem.transmitterMixerDownlinkForwardPowerSignal",
    "Transmitter Mixer Downlink Forward Power",
  ],
  "dashboard.alarmItem.nearEndBs1DownlinkInputPowerSignal": [
    "app.dashboard.alarmItem.nearEndBs1DownlinkInputPowerSignal",
    "Near-end Unit BS1 Downlink Input Power",
  ],
  "dashboard.alarmItem.nearEndBs1UplinkOutputRssiSignal": [
    "app.dashboard.alarmItem.nearEndBs1UplinkOutputRssiSignal",
    "Near-end Unit BS1 Uplink Output RSSI",
  ],
  "dashboard.alarmItem.splitterRxOutputRssiSignal": [
    "app.dashboard.alarmItem.splitterRxOutputRssiSignal",
    "Splitter RX Uplink Output RSSI",
  ],
  "dashboard.alarmItem.downlinkForwardPowerSignal": [
    "app.dashboard.alarmItem.downlinkForwardPowerSignal",
    "Downlink Forward Power",
  ],
  "dashboard.alarmItem.downlinkInputPowerSignal": [
    "app.dashboard.alarmItem.downlinkInputPowerSignal",
    "Downlink Input Power",
  ],
  "dashboard.alarmItem.uplinkOutputRssiSignal": [
    "app.dashboard.alarmItem.uplinkOutputRssiSignal",
    "Uplink Output RSSI",
  ],
  "dashboard.alarmItem.rxOutputRssiSignal": [
    "app.dashboard.alarmItem.rxOutputRssiSignal",
    "RX Output RSSI",
  ],
  "dashboard.action.checkDevice": ["app.dashboard.action.checkDevice", "Please check the device"],
  "dashboard.action.checkDeviceStatus": [
    "app.dashboard.action.checkDeviceStatus",
    "Please check the device status",
  ],
  "dashboard.action.checkDeviceConnection": [
    "app.dashboard.action.checkDeviceConnection",
    "Please check the device connection",
  ],
  "dashboard.action.checkDevicePowerSupplyAndNetworkConnection": [
    "app.dashboard.action.checkDevicePowerSupplyAndNetworkConnection",
    "Check the device power supply and network connection",
  ],
  "dashboard.action.checkPowerSupplyAndNetworkConnection": [
    "app.dashboard.action.checkPowerSupplyAndNetworkConnection",
    "Check the power supply and network connection",
  ],
  "dashboard.action.checkDevicePowerSupply": [
    "app.dashboard.action.checkDevicePowerSupply",
    "Check the device power supply",
  ],
  "dashboard.action.checkPowerSupply": [
    "app.dashboard.action.checkPowerSupply",
    "Check the power supply",
  ],
  "dashboard.action.checkNetworkConnection": [
    "app.dashboard.action.checkNetworkConnection",
    "Check the network connection",
  ],
  "dashboard.action.checkPower": ["app.dashboard.action.checkPower", "Please check the power"],
  "dashboard.action.checkRssi": ["app.dashboard.action.checkRssi", "Please check RSSI"],
  "dashboard.action.handleAlarm": [
    "app.dashboard.action.handleAlarm",
    "Please handle the alarm promptly",
  ],
  "dashboard.action.noAction": ["app.dashboard.action.noAction", "No action required"],
  "dashboard.action.checkFrequencyBoardModulePowerNetworkAndLibiioSamplingProcess": [
    "app.dashboard.action.checkFrequencyBoardModulePowerNetworkAndLibiioSamplingProcess",
    "Check the frequency board module power, network, and libiio sampling process",
  ],
  "dashboard.status.isAbnormal": ["app.dashboard.status.isAbnormal", "Abnormal"],
  "dashboard.status.isNormal": ["app.dashboard.status.isNormal", "Normal"],
  "dashboard.status.isHigh": ["app.dashboard.status.isHigh", "High"],
  "dashboard.status.isLow": ["app.dashboard.status.isLow", "Low"],
  "device.group.transmitter_mixer": [
    "app.device.index.group.transmitterMixer",
    "Transmitter Combiner",
  ],
  "device.group.splitter": ["app.device.index.group.receiverSplitter", "Splitter"],
  "device.group.bandpass_duplexer": [
    "app.device.index.group.bandpassDuplexer",
    "Bandpass Duplexer",
  ],
  "device.group.uplink_stripper": [
    "app.device.index.group.uplinkStripper",
    "Uplink Signal Stripper",
  ],
  "device.group.downlink_stripper": [
    "app.device.index.group.downlinkStripper",
    "Downlink Signal Stripper",
  ],
  "device.group.digital_near_end": [
    "app.device.index.group.digitalNearEnd",
    "Digital Near-end Unit",
  ],
  "device.group.digital_far_end": ["app.device.index.group.digitalRemote", "Digital Remote Unit"],
  "device.group.power_collection_gateway": [
    "app.device.index.group.powerCollectionGateway",
    "Power Collection Gateway",
  ],
  "device.group.analog_near_end": [
    "app.device.index.group.analogNearEnd",
    "Analog Near-end Unit",
  ],
  "device.group.analog_far_end": ["app.device.index.group.analogRemote", "Analog Remote Unit"],
  "device.group.trunk_amplifier": ["app.device.index.group.trunkAmplifier", "Trunk Amplifier"],
  "device.status.device_online": ["app.device.status.online", "Online"],
  "device.status.device_offline": ["app.device.status.offline", "Offline"],
  "device.status.maintaining": ["app.device.index.maintaining", "Maintaining"],
  "device.status.err": ["app.device.status.inAlarm", "In Alarm"],
  "device.status.online": ["app.device.status.online", "Online"],
  "device.status.offline": ["app.device.status.offline", "Offline"],
  "device.index.group.transmitterMixer": [
    "app.device.index.group.transmitterMixer",
    "Transmitter Mixer",
  ],
  "device.index.group.receiverSplitter": [
    "app.device.index.group.receiverSplitter",
    "Receiver Splitter",
  ],
  "device.index.group.nearEnd": ["app.device.index.group.nearEnd", "Near-end Unit"],
  "device.index.group.remote": ["app.device.index.group.remote", "Remote Unit"],
  "device.index.group.bandpassDuplexer": [
    "app.device.index.group.bandpassDuplexer",
    "Bandpass Duplexer",
  ],
  "device.index.group.uplinkStripper": [
    "app.device.index.group.uplinkStripper",
    "Uplink Signal Stripper",
  ],
  "device.index.group.downlinkStripper": [
    "app.device.index.group.downlinkStripper",
    "Downlink Signal Stripper",
  ],
  "device.index.group.digitalNearEnd": [
    "app.device.index.group.digitalNearEnd",
    "Digital Near-end Unit",
  ],
  "device.index.group.digitalRemote": [
    "app.device.index.group.digitalRemote",
    "Digital Remote Unit",
  ],
  "device.index.group.analogNearEnd": [
    "app.device.index.group.analogNearEnd",
    "Analog Near-end Unit",
  ],
  "device.index.group.analogRemote": ["app.device.index.group.analogRemote", "Analog Remote Unit"],
  "device.index.group.trunkAmplifier": ["app.device.index.group.trunkAmplifier", "Trunk Amplifier"],
  "device.index.group.powerCollectionGateway": [
    "app.device.index.group.powerCollectionGateway",
    "Power Collection Gateway",
  ],
  "device.status.inAlarm": ["app.device.status.inAlarm", "In Alarm"],
  "device.status.moduleOffline": ["app.device.status.moduleOffline", "Module Offline"],
  "device.config.device_offline": ["app.device.status.offline", "Offline"],
  "device.libiio.module.rx": ["app.device.libiio.module.rx", "RX Module"],
  "device.libiio.module.tx": ["app.device.libiio.module.tx", "TX Module"],
  "device.libiio.module.rxOffline": ["app.device.libiio.module.rxOffline", "RX Module Offline"],
  "device.libiio.module.txOffline": ["app.device.libiio.module.txOffline", "TX Module Offline"],
  "device.libiio.frequencyPoint": ["app.device.libiio.frequencyPoint", "Frequency Point"],
  "device.libiio.rxFrequencyPoint": ["app.device.libiio.rxFrequencyPoint", "RX Frequency Point"],
  "device.libiio.txFrequencyPoint": ["app.device.libiio.txFrequencyPoint", "TX Frequency Point"],
  "device.libiio.board.statusAbnormal": ["app.device.libiio.board.statusAbnormal", "Abnormal"],
  "device.libiio.board.statusNormal": ["app.device.libiio.board.statusNormal", "Normal"],
  "device.libiio.board.statusHigh": ["app.device.libiio.board.statusHigh", "High"],
  "device.libiio.board.statusLow": ["app.device.libiio.board.statusLow", "Low"],
  "device.libiio.board.frequency": ["app.device.libiio.board.frequency", "Frequency"],
  "device.libiio.board.power": ["app.device.libiio.board.power", "Power"],
  "device.libiio.rxRssi": ["app.device.libiio.rxRssi", "RX RSSI"],
  "device.libiio.rxRssiWithUnit": ["app.device.libiio.rxRssiWithUnit", "RSSI (dBm)"],
  "device.libiio.txPower": ["app.device.libiio.txPower", "TX Power (dBm)"],
  "device.libiio.txMonitorPowerWithUnit": ["app.device.libiio.txMonitorPowerWithUnit", "Power (W)"],
  "device.libiio.deviceFullScalePower": [
    "app.device.libiio.deviceFullScalePower",
    "Device 0 dBFS Full-scale Power",
  ],
  "device.libiio.txPowerOffsetDb": ["app.device.libiio.txPowerOffsetDb", "TX Power Offset (dB)"],
  "device.libiio.txHardwareGainDb": ["app.device.libiio.txHardwareGainDb", "Hardware Gain (dB)"],
  "device.libiio.rxRssiOffsetDb": ["app.device.libiio.rxRssiOffsetDb", "RX RSSI Offset (dB)"],
  "device.libiio.rxHardwareGainDb": ["app.device.libiio.rxHardwareGainDb", "Hardware Gain (dB)"],
  "libiio.module.tx": ["app.device.libiio.module.tx", "TX Module"],
  "libiio.module.rx": ["app.device.libiio.module.rx", "RX Module"],
  "libiio.module.status.offline": ["app.device.status.moduleOffline", "Module Offline"],
  "libiio.module.status.normal": ["app.device.libiio.board.statusNormal", "Normal"],
  "libiio.module.status.abnormal": ["app.device.libiio.board.statusAbnormal", "Abnormal"],
  "libiio.metric.power_w": ["app.device.libiio.txMonitorPowerWithUnit", "Power (W)"],
  "libiio.metric.rssi_dbm": ["app.device.libiio.rxRssiWithUnit", "RSSI (dBm)"],
  "libiio.config.tx_module_offline": ["app.device.libiio.module.txOffline", "TX Module Offline"],
  "libiio.config.rx_module_offline": ["app.device.libiio.module.rxOffline", "RX Module Offline"],
  "libiio.config.rx_frequency_abnormal": [
    "app.device.libiio.board.statusAbnormal",
    "Abnormal",
  ],
}

const DEVICE_GROUP_KEYS: Record<string, string> = {
  mixer: "transmitterMixer",
  splitter: "receiverSplitter",
  receiver: "receiverSplitter",
  "near-end": "digitalNearEnd",
  remote: "digitalRemote",
}

const BACKEND_TEXT_PART_KEYS: [string, [string, string]][] = [
  [
    "transmitter mixer downlink forward power signal",
    [
      "app.dashboard.alarmItem.transmitterMixerDownlinkForwardPowerSignal",
      "Transmitter Mixer Downlink Forward Power",
    ],
  ],
  [
    "transmitter mixer downlink forward power",
    [
      "app.dashboard.alarmItem.transmitterMixerDownlinkForwardPowerSignal",
      "Transmitter Mixer Downlink Forward Power",
    ],
  ],
  [
    "near-end unit bs1 downlink input power",
    [
      "app.dashboard.alarmItem.nearEndBs1DownlinkInputPowerSignal",
      "Near-end Unit BS1 Downlink Input Power",
    ],
  ],
  [
    "near-end bs1 downlink input power signal",
    [
      "app.dashboard.alarmItem.nearEndBs1DownlinkInputPowerSignal",
      "Near-end Unit BS1 Downlink Input Power",
    ],
  ],
  [
    "near end bs1 downlink input power signal",
    [
      "app.dashboard.alarmItem.nearEndBs1DownlinkInputPowerSignal",
      "Near-end Unit BS1 Downlink Input Power",
    ],
  ],
  [
    "near-end unit bs1 uplink output rssi",
    [
      "app.dashboard.alarmItem.nearEndBs1UplinkOutputRssiSignal",
      "Near-end Unit BS1 Uplink Output RSSI",
    ],
  ],
  [
    "near-end bs1 uplink output rssi signal",
    [
      "app.dashboard.alarmItem.nearEndBs1UplinkOutputRssiSignal",
      "Near-end Unit BS1 Uplink Output RSSI",
    ],
  ],
  [
    "near end bs1 uplink output rssi signal",
    [
      "app.dashboard.alarmItem.nearEndBs1UplinkOutputRssiSignal",
      "Near-end Unit BS1 Uplink Output RSSI",
    ],
  ],
  [
    "splitter rx uplink output rssi",
    ["app.dashboard.alarmItem.splitterRxOutputRssiSignal", "Splitter RX Uplink Output RSSI"],
  ],
  [
    "splitter rx output rssi signal",
    ["app.dashboard.alarmItem.splitterRxOutputRssiSignal", "Splitter RX Uplink Output RSSI"],
  ],
  [
    "downlink forward power signal",
    ["app.dashboard.alarmItem.downlinkForwardPowerSignal", "Downlink Forward Power"],
  ],
  [
    "downlink forward power",
    ["app.dashboard.alarmItem.downlinkForwardPowerSignal", "Downlink Forward Power"],
  ],
  [
    "downlink input power signal",
    ["app.dashboard.alarmItem.downlinkInputPowerSignal", "Downlink Input Power"],
  ],
  [
    "downlink input power",
    ["app.dashboard.alarmItem.downlinkInputPowerSignal", "Downlink Input Power"],
  ],
  [
    "uplink output rssi signal",
    ["app.dashboard.alarmItem.uplinkOutputRssiSignal", "Uplink Output RSSI"],
  ],
  ["uplink output rssi", ["app.dashboard.alarmItem.uplinkOutputRssiSignal", "Uplink Output RSSI"]],
  ["rx output rssi signal", ["app.dashboard.alarmItem.rxOutputRssiSignal", "RX Output RSSI"]],
  ["rx output rssi", ["app.dashboard.alarmItem.rxOutputRssiSignal", "RX Output RSSI"]],
  [
    "please check the device connection",
    ["app.dashboard.action.checkDeviceConnection", "Please check the device connection"],
  ],
  [
    "please check device connection",
    ["app.dashboard.action.checkDeviceConnection", "Please check the device connection"],
  ],
  [
    "check device connection",
    ["app.dashboard.action.checkDeviceConnection", "Please check the device connection"],
  ],
  [
    "check the device power supply and network connection",
    [
      "app.dashboard.action.checkDevicePowerSupplyAndNetworkConnection",
      "Check the device power supply and network connection",
    ],
  ],
  [
    "please check the device power supply and network connection",
    [
      "app.dashboard.action.checkDevicePowerSupplyAndNetworkConnection",
      "Check the device power supply and network connection",
    ],
  ],
  [
    "check device power supply and network connection",
    [
      "app.dashboard.action.checkDevicePowerSupplyAndNetworkConnection",
      "Check the device power supply and network connection",
    ],
  ],
  [
    "please check device power supply and network connection",
    [
      "app.dashboard.action.checkDevicePowerSupplyAndNetworkConnection",
      "Check the device power supply and network connection",
    ],
  ],
  [
    "please check the power supply and network connection",
    [
      "app.dashboard.action.checkPowerSupplyAndNetworkConnection",
      "Check the power supply and network connection",
    ],
  ],
  [
    "please check power supply and network connection",
    [
      "app.dashboard.action.checkPowerSupplyAndNetworkConnection",
      "Check the power supply and network connection",
    ],
  ],
  [
    "check the power supply and network connection",
    [
      "app.dashboard.action.checkPowerSupplyAndNetworkConnection",
      "Check the power supply and network connection",
    ],
  ],
  [
    "check power supply and network connection",
    [
      "app.dashboard.action.checkPowerSupplyAndNetworkConnection",
      "Check the power supply and network connection",
    ],
  ],
  [
    "please check the device power supply",
    ["app.dashboard.action.checkDevicePowerSupply", "Check the device power supply"],
  ],
  [
    "please check device power supply",
    ["app.dashboard.action.checkDevicePowerSupply", "Check the device power supply"],
  ],
  [
    "check the device power supply",
    ["app.dashboard.action.checkDevicePowerSupply", "Check the device power supply"],
  ],
  [
    "check device power supply",
    ["app.dashboard.action.checkDevicePowerSupply", "Check the device power supply"],
  ],
  [
    "please check the power supply",
    ["app.dashboard.action.checkPowerSupply", "Check the power supply"],
  ],
  [
    "please check power supply",
    ["app.dashboard.action.checkPowerSupply", "Check the power supply"],
  ],
  ["check the power supply", ["app.dashboard.action.checkPowerSupply", "Check the power supply"]],
  ["check power supply", ["app.dashboard.action.checkPowerSupply", "Check the power supply"]],
  [
    "please check the network connection",
    ["app.dashboard.action.checkNetworkConnection", "Check the network connection"],
  ],
  [
    "please check network connection",
    ["app.dashboard.action.checkNetworkConnection", "Check the network connection"],
  ],
  [
    "check the network connection",
    ["app.dashboard.action.checkNetworkConnection", "Check the network connection"],
  ],
  [
    "check network connection",
    ["app.dashboard.action.checkNetworkConnection", "Check the network connection"],
  ],
  [
    "please check the device status",
    ["app.dashboard.action.checkDeviceStatus", "Please check the device status"],
  ],
  [
    "please check device status",
    ["app.dashboard.action.checkDeviceStatus", "Please check the device status"],
  ],
  [
    "check device status",
    ["app.dashboard.action.checkDeviceStatus", "Please check the device status"],
  ],
  ["please check the device", ["app.dashboard.action.checkDevice", "Please check the device"]],
  ["please check device", ["app.dashboard.action.checkDevice", "Please check the device"]],
  ["please check the power", ["app.dashboard.action.checkPower", "Please check the power"]],
  ["please check power", ["app.dashboard.action.checkPower", "Please check the power"]],
  ["please check rssi", ["app.dashboard.action.checkRssi", "Please check RSSI"]],
  ["please check", ["app.dashboard.action.checkPrefix", "Please check"]],
  ["no action required", ["app.dashboard.action.noAction", "No action required"]],
  [
    "please check the frequency board module power, network, and libiio sampling process",
    [
      "app.dashboard.action.checkFrequencyBoardModulePowerNetworkAndLibiioSamplingProcess",
      "Check the frequency board module power, network, and libiio sampling process",
    ],
  ],
  [
    "please check the frequency board module power, network and libiio sampling process",
    [
      "app.dashboard.action.checkFrequencyBoardModulePowerNetworkAndLibiioSamplingProcess",
      "Check the frequency board module power, network, and libiio sampling process",
    ],
  ],
  [
    "check the frequency board module power, network, and libiio sampling process",
    [
      "app.dashboard.action.checkFrequencyBoardModulePowerNetworkAndLibiioSamplingProcess",
      "Check the frequency board module power, network, and libiio sampling process",
    ],
  ],
  [
    "check the frequency board module power, network and libiio sampling process",
    [
      "app.dashboard.action.checkFrequencyBoardModulePowerNetworkAndLibiioSamplingProcess",
      "Check the frequency board module power, network, and libiio sampling process",
    ],
  ],
  ["abnormal", ["app.dashboard.status.isAbnormal", "Abnormal"]],
  ["normal", ["app.dashboard.status.isNormal", "Normal"]],
  ["high", ["app.dashboard.status.isHigh", "High"]],
  ["low", ["app.dashboard.status.isLow", "Low"]],
]

const replaceValues = (message: string, values?: MessageValues) => {
  if (!values) {
    return message
  }

  return Object.entries(values).reduce(
    (acc, [key, value]) =>
      acc.replace(new RegExp(`\\$\\{${key}\\}|\\{${key}\\}`, "g"), String(value)),
    message,
  )
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const createBackendTextPartRegExp = (pattern: string) => {
  const escapedPattern = escapeRegExp(pattern)

  return /^[a-z0-9 -]+$/i.test(pattern)
    ? new RegExp(`(^|[^a-z0-9])(${escapedPattern})(?=$|[^a-z0-9])`, "gi")
    : new RegExp(escapedPattern, "gi")
}

const BACKEND_CODE_KEY_LOOKUP = Object.entries(BACKEND_CODE_KEYS).reduce((acc, [key, value]) => {
  acc[key] = value
  acc[key.toLowerCase()] = value
  return acc
}, {} as Record<string, [string, string]>)

const isBackendI18nPayload = (value: BackendI18nValue): value is BackendI18nPayload =>
  !!value && typeof value === "object"

const getTextValue = (...values: (string | null | undefined)[]) => {
  const text = values.find((item) => item?.trim())

  return text?.trim() || ""
}

const getMessageValues = (params?: BackendMessageParams | null): MessageValues | undefined => {
  if (!params) {
    return undefined
  }

  const values = Object.entries(params).reduce((acc, [key, value]) => {
    if (value === null || value === undefined) {
      return acc
    }

    acc[key] = typeof value === "boolean" ? String(value) : value
    return acc
  }, {} as MessageValues)

  return Object.keys(values).length ? values : undefined
}

const getBackendMessageKey = (value?: string | null) => {
  const trimmedValue = value?.trim()
  if (!trimmedValue) {
    return undefined
  }

  const lowerValue = trimmedValue.toLowerCase()
  const codeKey = BACKEND_CODE_KEY_LOOKUP[trimmedValue] || BACKEND_CODE_KEY_LOOKUP[lowerValue]
  if (codeKey) {
    return codeKey
  }

  if (trimmedValue.startsWith("app.")) {
    return [trimmedValue, trimmedValue]
  }

  return BACKEND_LABEL_KEYS[trimmedValue] || BACKEND_LABEL_KEYS[lowerValue]
}

export const getRuntimeLocale = () => {
  if (!I18N_ENABLED) {
    return BASE_LOCALE
  }

  if (typeof window === "undefined") {
    return BASE_LOCALE
  }

  return localStorage.getItem(LOCALE_STORAGE_KEY) || BASE_LOCALE
}

export const formatRuntimeMessage = (
  id: string,
  defaultMessage: string,
  values?: MessageValues,
) => {
  const locale = getRuntimeLocale()
  const message =
    RUNTIME_MESSAGES[locale]?.[id] || RUNTIME_MESSAGES[DEFAULT_LOCALE]?.[id] || defaultMessage

  return replaceValues(message, values)
}

export const formatMessageWith = (
  t: Translate,
  id: string,
  defaultMessage: string,
  values?: MessageValues,
) => replaceValues(t(id, defaultMessage, values), values)

const formatBackendStringLabel = (value?: string | null, t?: Translate) => {
  const trimmedValue = value?.trim()
  if (!trimmedValue) {
    return ""
  }

  const labelKey = getBackendMessageKey(trimmedValue)

  if (labelKey) {
    return t
      ? formatMessageWith(t, labelKey[0], labelKey[1])
      : formatRuntimeMessage(labelKey[0], labelKey[1])
  }

  const lowerValue = trimmedValue.toLowerCase()
  const translatedText = BACKEND_TEXT_PART_KEYS.reduce((text, [pattern, messageKey]) => {
    if (!lowerValue.includes(pattern)) {
      return text
    }

    const translatedPart = t
      ? formatMessageWith(t, messageKey[0], messageKey[1])
      : formatRuntimeMessage(messageKey[0], messageKey[1])

    return text.replace(
      createBackendTextPartRegExp(pattern),
      (_match, prefix = "") => `${prefix}${translatedPart}`,
    )
  }, trimmedValue)

  return translatedText
}

export const resolveSystemDisplayName = (systemName?: string | null, fallbackName?: string) => {
  const trimmedSystemName = systemName?.trim()
  const defaultName =
    fallbackName || formatRuntimeMessage("app.system.defaultName", DEFAULT_SYSTEM_NAME_EN)

  if (!trimmedSystemName) {
    return defaultName
  }

  const compareName =
    trimmedSystemName === DEFAULT_SYSTEM_NAME_ZH
      ? trimmedSystemName
      : trimmedSystemName.toLowerCase()

  return DEFAULT_SYSTEM_NAME_VALUES.has(compareName) ? defaultName : trimmedSystemName
}

export const formatBackendLabel = (value?: BackendI18nValue, t?: Translate) => {
  if (typeof value === "string") {
    return formatBackendStringLabel(value, t)
  }

  if (!isBackendI18nPayload(value)) {
    return ""
  }

  const messageKey = getTextValue(value.key)
  const fallback = getTextValue(value.fallback, value.defaultMessage, value.value, value.code)
  const values = getMessageValues(value.params)
  const mappedMessageKey = getBackendMessageKey(messageKey)

  if (mappedMessageKey) {
    return t
      ? formatMessageWith(t, mappedMessageKey[0], fallback || mappedMessageKey[1], values)
      : formatRuntimeMessage(mappedMessageKey[0], fallback || mappedMessageKey[1], values)
  }

  if (messageKey) {
    return t
      ? formatMessageWith(t, messageKey, fallback, values)
      : formatRuntimeMessage(messageKey, fallback, values)
  }

  const codeKey = getBackendMessageKey(value.code)
  if (codeKey) {
    return t
      ? formatMessageWith(t, codeKey[0], fallback || codeKey[1], values)
      : formatRuntimeMessage(codeKey[0], fallback || codeKey[1], values)
  }

  return formatBackendStringLabel(fallback, t) || fallback
}

export const formatBackendKeyedValue = (
  value?: BackendKeyedValue | null,
  t?: Translate,
): string => {
  if (!value) {
    return ""
  }

  return formatBackendLabel(
    {
      key: value.key,
      code: value.code,
      params: value.params,
      fallback: value.fallback,
    },
    t,
  )
}

export const formatApiResponseMessage = (
  response?: {
    msg?: string | null
    msg_key?: string | null
    res_key?: string | null
    event_code?: string | null
    event_params?: BackendMessageParams | null
  },
  fallback = "",
  t?: Translate,
) => {
  if (!response) {
    return fallback
  }

  return (
    formatBackendKeyedValue(
    {
      key: response.res_key || response.msg_key || response.event_code,
      params: response.event_params,
      fallback: response.msg || fallback,
    },
    t,
    ) ||
    response.msg ||
    fallback
  )
}

export const getDeviceGroupKey = (value?: string | null) => {
  const trimmedValue = value?.trim()
  if (!trimmedValue) {
    return ""
  }

  const normalizedValue = trimmedValue.startsWith("device.group.")
    ? trimmedValue.replace("device.group.", "")
    : trimmedValue

  return (
    DEVICE_GROUP_KEYS[trimmedValue] ||
    DEVICE_GROUP_KEYS[trimmedValue.toLowerCase()] ||
    DEVICE_GROUP_KEYS[normalizedValue] ||
    DEVICE_GROUP_KEYS[normalizedValue.toLowerCase()] ||
    ""
  )
}

export const isNearEndDeviceGroup = (value?: string | null) =>
  ["digitalNearEnd", "analogNearEnd"].includes(getDeviceGroupKey(value))

export const isRemoteDeviceGroup = (value?: string | null) =>
  ["digitalRemote", "analogRemote"].includes(getDeviceGroupKey(value))

export const isSplitterDeviceGroup = (value?: string | null) =>
  getDeviceGroupKey(value) === "receiverSplitter"

export const isAmplifierDeviceGroup = (value?: string | null) =>
  getDeviceGroupKey(value) === "trunkAmplifier"

export const isRfSettingDeviceGroup = (value?: string | null) =>
  [
    "digitalRemote",
    "analogRemote",
    "trunkAmplifier",
    "digitalNearEnd",
    "analogNearEnd",
    "receiverSplitter",
  ].includes(getDeviceGroupKey(value))

export const isRecoveryLog = (value?: string | null) => {
  const lowerValue = value?.toLowerCase() || ""
  return (
    lowerValue.includes("恢复") ||
    lowerValue.includes("上线") ||
    lowerValue.includes("recover") ||
    lowerValue.includes("online")
  )
}

export const createBackendLabelFormatter =
  (t: Translate) =>
  (value?: BackendI18nValue, fallback = "") =>
    formatBackendLabel(value || fallback, t) || fallback

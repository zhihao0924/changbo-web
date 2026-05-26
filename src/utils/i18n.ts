export type MessageValues = Record<string, string | number>

export type Translate = (id: string, defaultMessage: string, values?: MessageValues) => string

export const DEFAULT_LOCALE = "en-US"
export const LOCALE_STORAGE_KEY = "umi_locale"

const RUNTIME_MESSAGES: Record<string, Record<string, string>> = {
  "en-US": {
    "app.system.defaultName": "Private Network Communication Intelligent NMS",
    "app.common.refresh": "Refresh",
    "app.common.requesting": "Loading...",
    "app.common.serviceError": "Service error",
    "app.common.unknownError": "Unknown error",
    "app.common.tokenExpired": "Token expired. Please sign in again.",
    "app.global.offline": "You are offline",
    "app.global.updateAvailable": "New content available",
    "app.global.updateDescription": "Click Refresh or reload the page manually.",
    "app.version.updateTitle": "Updated to v${version}",
  },
  "zh-CN": {
    "app.system.defaultName": "专网通信智能网管平台",
    "app.common.refresh": "刷新",
    "app.common.requesting": "数据请求中...",
    "app.common.serviceError": "服务错误",
    "app.common.unknownError": "未知错误",
    "app.common.tokenExpired": "token失效，请重新登陆！",
    "app.global.offline": "当前处于离线状态",
    "app.global.updateAvailable": "有新内容",
    "app.global.updateDescription": "请点击“刷新”按钮或者手动刷新页面",
    "app.version.updateTitle": "更新v${version}版本",
  },
}

const BACKEND_LABEL_KEYS: Record<string, [string, string]> = {
  发射合路器: ["app.device.index.group.transmitterMixer", "Transmitter Mixer"],
  "transmitter mixer": ["app.device.index.group.transmitterMixer", "Transmitter Mixer"],
  接收分路器: ["app.device.index.group.receiverSplitter", "Receiver Splitter"],
  "receiver splitter": ["app.device.index.group.receiverSplitter", "Receiver Splitter"],
  带通双工器: ["app.device.index.group.bandpassDuplexer", "Bandpass Duplexer"],
  "bandpass duplexer": ["app.device.index.group.bandpassDuplexer", "Bandpass Duplexer"],
  上行信号剥离器: ["app.device.index.group.uplinkStripper", "Uplink Signal Stripper"],
  "uplink signal stripper": ["app.device.index.group.uplinkStripper", "Uplink Signal Stripper"],
  下行信号剥离器: ["app.device.index.group.downlinkStripper", "Downlink Signal Stripper"],
  "downlink signal stripper": [
    "app.device.index.group.downlinkStripper",
    "Downlink Signal Stripper",
  ],
  数字近端机: ["app.device.index.group.digitalNearEnd", "Digital Near-end Unit"],
  "digital near-end unit": ["app.device.index.group.digitalNearEnd", "Digital Near-end Unit"],
  数字远端机: ["app.device.index.group.digitalRemote", "Digital Remote Unit"],
  "digital remote unit": ["app.device.index.group.digitalRemote", "Digital Remote Unit"],
  模拟近端机: ["app.device.index.group.analogNearEnd", "Analog Near-end Unit"],
  "analog near-end unit": ["app.device.index.group.analogNearEnd", "Analog Near-end Unit"],
  模拟远端机: ["app.device.index.group.analogRemote", "Analog Remote Unit"],
  "analog remote unit": ["app.device.index.group.analogRemote", "Analog Remote Unit"],
  干线放大器: ["app.device.index.group.trunkAmplifier", "Trunk Amplifier"],
  "trunk amplifier": ["app.device.index.group.trunkAmplifier", "Trunk Amplifier"],
  功率采集网关: ["app.device.index.group.powerCollectionGateway", "Power Collection Gateway"],
  "power collection gateway": [
    "app.device.index.group.powerCollectionGateway",
    "Power Collection Gateway",
  ],

  上行功率: ["app.device.index.uplinkPowerShort", "Uplink Power"],
  "上行功率（dBm）": ["app.device.index.uplinkPower", "Uplink Power (dBm)"],
  "上行功率 (dBm)": ["app.device.index.uplinkPower", "Uplink Power (dBm)"],
  "uplink power": ["app.device.index.uplinkPowerShort", "Uplink Power"],
  上行增益: ["app.device.index.uplinkGainShort", "Uplink Gain"],
  "上行增益（dB）": ["app.device.index.uplinkGain", "Uplink Gain (dB)"],
  "上行增益 (dB)": ["app.device.index.uplinkGain", "Uplink Gain (dB)"],
  "uplink gain": ["app.device.index.uplinkGainShort", "Uplink Gain"],
  下行功率: ["app.device.index.downlinkPowerShort", "Downlink Power"],
  "下行功率（dBm）": ["app.device.index.downlinkPower", "Downlink Power (dBm)"],
  "下行功率 (dBm)": ["app.device.index.downlinkPower", "Downlink Power (dBm)"],
  "downlink power": ["app.device.index.downlinkPowerShort", "Downlink Power"],
  下行增益: ["app.device.index.downlinkGainShort", "Downlink Gain"],
  "下行增益（dB）": ["app.device.index.downlinkGain", "Downlink Gain (dB)"],
  "下行增益 (dB)": ["app.device.index.downlinkGain", "Downlink Gain (dB)"],
  "downlink gain": ["app.device.index.downlinkGainShort", "Downlink Gain"],
  同频转发: ["app.device.index.sameFrequencyForward", "Same Frequency Forward"],
  "same frequency forward": ["app.device.index.sameFrequencyForward", "Same Frequency Forward"],
  下行开关: ["app.device.index.downlinkSwitch", "Downlink Switch"],
  "downlink switch": ["app.device.index.downlinkSwitch", "Downlink Switch"],
  上行开关: ["app.device.index.uplinkSwitch", "Uplink Switch"],
  "uplink switch": ["app.device.index.uplinkSwitch", "Uplink Switch"],
  PA4告警开关: ["app.device.index.pa4AlarmSwitch", "PA4 Alarm Switch"],
  "pa4 alarm switch": ["app.device.index.pa4AlarmSwitch", "PA4 Alarm Switch"],

  rx: ["app.device.libiio.module.rx", "RX Module"],
  "rx module": ["app.device.libiio.module.rx", "RX Module"],
  "rx 模块": ["app.device.libiio.module.rx", "RX Module"],
  tx: ["app.device.libiio.module.tx", "TX Module"],
  "tx module": ["app.device.libiio.module.tx", "TX Module"],
  "tx 模块": ["app.device.libiio.module.tx", "TX Module"],
  频率: ["app.device.libiio.board.frequency", "Frequency"],
  "频率 (MHz)": ["app.device.libiio.board.frequency", "Frequency"],
  frequency: ["app.device.libiio.board.frequency", "Frequency"],
  功率: ["app.device.libiio.board.power", "Power"],
  "功率 (W)": ["app.device.libiio.txMonitorPowerWithUnit", "Power (W)"],
  power: ["app.device.libiio.board.power", "Power"],
  "power (w)": ["app.device.libiio.txMonitorPowerWithUnit", "Power (W)"],
  TX发射功率: ["app.device.libiio.type.txPower", "TX Transmit Power"],
  "TX发射功率 (dBm)": ["app.device.libiio.txPower", "TX Power (dBm)"],
  发射功率: ["app.device.libiio.txPower", "TX Power (dBm)"],
  rssi: ["app.device.libiio.rxRssi", "RX RSSI"],
  "rssi (dbm)": ["app.device.libiio.rxRssiWithUnit", "RSSI (dBm)"],
  RX接收RSSI: ["app.device.libiio.type.rxRssi", "RX Receive RSSI"],
  "RX接收RSSI (dBm)": ["app.device.libiio.rxRssiWithUnit", "RSSI (dBm)"],
  接收RSSI: ["app.device.libiio.rxRssiWithUnit", "RSSI (dBm)"],

  在线: ["app.device.status.online", "Online"],
  online: ["app.device.status.online", "Online"],
  离线: ["app.device.status.offline", "Offline"],
  offline: ["app.device.status.offline", "Offline"],
  告警: ["app.dashboard.alarm", "Alarm"],
  alarm: ["app.dashboard.alarm", "Alarm"],
  告警中: ["app.device.status.inAlarm", "In Alarm"],
  "in alarm": ["app.device.status.inAlarm", "In Alarm"],
  模块离线: ["app.device.status.moduleOffline", "Module Offline"],
  "module offline": ["app.device.status.moduleOffline", "Module Offline"],
  维护中: ["app.device.index.maintaining", "Maintaining"],
  maintaining: ["app.device.index.maintaining", "Maintaining"],
  正常: ["app.device.libiio.board.statusNormal", "Normal"],
  normal: ["app.device.libiio.board.statusNormal", "Normal"],
  异常: ["app.device.libiio.board.statusAbnormal", "Abnormal"],
  abnormal: ["app.device.libiio.board.statusAbnormal", "Abnormal"],
  偏高: ["app.device.libiio.board.statusHigh", "High"],
  high: ["app.device.libiio.board.statusHigh", "High"],
  偏低: ["app.device.libiio.board.statusLow", "Low"],
  low: ["app.device.libiio.board.statusLow", "Low"],
}

const DEVICE_GROUP_KEYS: Record<string, string> = {
  发射合路器: "transmitterMixer",
  "transmitter mixer": "transmitterMixer",
  接收分路器: "receiverSplitter",
  "receiver splitter": "receiverSplitter",
  带通双工器: "bandpassDuplexer",
  "bandpass duplexer": "bandpassDuplexer",
  上行信号剥离器: "uplinkStripper",
  "uplink signal stripper": "uplinkStripper",
  下行信号剥离器: "downlinkStripper",
  "downlink signal stripper": "downlinkStripper",
  数字近端机: "digitalNearEnd",
  "digital near-end unit": "digitalNearEnd",
  模拟近端机: "analogNearEnd",
  "analog near-end unit": "analogNearEnd",
  数字远端机: "digitalRemote",
  "digital remote unit": "digitalRemote",
  模拟远端机: "analogRemote",
  "analog remote unit": "analogRemote",
  干线放大器: "trunkAmplifier",
  "trunk amplifier": "trunkAmplifier",
  功率采集网关: "powerCollectionGateway",
  "power collection gateway": "powerCollectionGateway",
}

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

export const getRuntimeLocale = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE
  }

  return localStorage.getItem(LOCALE_STORAGE_KEY) || DEFAULT_LOCALE
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

export const normalizeBackendLabel = (value?: string | null, t?: Translate) => {
  const normalizedValue = value?.trim()
  if (!normalizedValue) {
    return ""
  }

  const labelKey =
    BACKEND_LABEL_KEYS[normalizedValue] || BACKEND_LABEL_KEYS[normalizedValue.toLowerCase()]

  if (!labelKey) {
    return normalizedValue
  }

  return t
    ? formatMessageWith(t, labelKey[0], labelKey[1])
    : formatRuntimeMessage(labelKey[0], labelKey[1])
}

export const getDeviceGroupKey = (value?: string | null) => {
  const normalizedValue = value?.trim()
  if (!normalizedValue) {
    return ""
  }

  return (
    DEVICE_GROUP_KEYS[normalizedValue] || DEVICE_GROUP_KEYS[normalizedValue.toLowerCase()] || ""
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
  const normalizedValue = value?.toLowerCase() || ""
  return (
    normalizedValue.includes("恢复") ||
    normalizedValue.includes("上线") ||
    normalizedValue.includes("recover") ||
    normalizedValue.includes("online")
  )
}

export const createBackendLabelFormatter =
  (t: Translate) =>
  (value?: string | null, fallback = "") =>
    normalizeBackendLabel(value || fallback, t) || fallback

import { PageContainer } from "@ant-design/pro-components"
import { Card, Empty, Spin } from "antd"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useIntl } from "umi"
import Services from "@/pages/device/services"
import type {
  API_PostLibiioBoardList,
  API_PostLibiioDeviceConfigList,
  API_PostLibiioDeviceList,
} from "@/pages/device/services/typings/device"
import "./index.less"

type ModuleDirection = "rx" | "tx"
type BoardDevice = API_PostLibiioBoardList.List
type BoardModule = API_PostLibiioBoardList.Module
type BoardChannel = API_PostLibiioBoardList.Channel
type LegacyLibiioDevice = API_PostLibiioDeviceList.List
type LegacyFrequencyConfig = API_PostLibiioDeviceConfigList.ConfigItem
type BoardSection = {
  key: string
  device: BoardDevice
  direction: ModuleDirection
  directionLabel: string
  moduleIp?: string
  metricLabel: string
  metricUnit: string
  chunks: FrequencyChunk<BoardChannel>[]
}

const MAX_FETCH_SIZE = 1000
const CHANNELS_PER_ROW = 10
const CHANNEL_COLUMNS = Array.from({ length: CHANNELS_PER_ROW }, (_, index) => index + 1)
const MAX_CHANNEL_COUNT = 20
const MODULE_DIRECTIONS: ModuleDirection[] = ["rx", "tx"]
const BOARD_MODULE_ORDER: ModuleDirection[] = ["tx", "rx"]
type FrequencyChunk<T> = { key: string; channelOffset: number; items: T[] }
type StatusTone = "normal" | "high" | "low" | "none"
type DisplayRow = { label: string; values: string[]; statusTones?: StatusTone[] }

const normalizeNumber = (value?: number | string | null) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === "string" && value.trim()) {
    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? numberValue : null
  }

  return null
}

const isAlarmEnabled = (value?: number | string | boolean | null) =>
  value === true || value === 1 || value === "1" || value === "true"

const getConfigMapKey = (deviceId: number, direction: ModuleDirection) => `${deviceId}-${direction}`

const formatFrequency = (value?: number | string | null) => {
  const numberValue = normalizeNumber(value)
  return numberValue !== null ? `${numberValue} MHz` : "-"
}

const formatMetricValue = (value?: number | string | null, suffix?: string) => {
  const numberValue = normalizeNumber(value)
  return numberValue !== null ? `${numberValue}${suffix || ""}` : "-"
}

const getStatusClassName = (tone?: StatusTone) => {
  if (tone === "normal") {
    return "libiio-board-table__accent-open"
  }
  if (tone === "high") {
    return "libiio-board-table__accent-high"
  }
  if (tone === "low") {
    return "libiio-board-table__accent-low"
  }
  return ""
}

const sortConfigs = <T extends { sort?: number; id?: number }>(items: T[]) =>
  [...items].sort((prev, next) => {
    const prevSort = typeof prev.sort === "number" ? prev.sort : Number.MAX_SAFE_INTEGER
    const nextSort = typeof next.sort === "number" ? next.sort : Number.MAX_SAFE_INTEGER

    if (prevSort !== nextSort) {
      return prevSort - nextSort
    }

    return (prev.id || 0) - (next.id || 0)
  })

const normalizeChannels = (channels: BoardChannel[] = []) => {
  const channelMap = new Map(channels.map((channel) => [channel.channel_no, channel]))
  const maxChannelNo = Math.max(...channels.map((channel) => channel.channel_no), 0)
  const targetChannelCount = maxChannelNo > CHANNELS_PER_ROW ? MAX_CHANNEL_COUNT : CHANNELS_PER_ROW

  return Array.from({ length: targetChannelCount }, (_, index) => {
    const channelNo = index + 1
    return (
      channelMap.get(channelNo) || {
        channel_no: channelNo,
        configured: false,
        target_freq_mhz: null,
        metric_value: null,
        alarm_enabled: 0,
        alarm_status: null,
        status_text: "-",
      }
    )
  })
}

const getMetricValue = (
  channel: Partial<BoardChannel>,
  direction: ModuleDirection,
  config?: LegacyFrequencyConfig,
) =>
  direction === "tx"
    ? normalizeNumber(channel.power_w ?? config?.power_w)
    : normalizeNumber(
        channel.rssi_dbm ??
          channel.metric_value ??
          config?.rssi_dbm ??
          config?.metric_value ??
          config?.fix_val ??
          config?.rx_gain,
      )

const getConfigByChannel = (
  channel: BoardChannel,
  configs: LegacyFrequencyConfig[],
): LegacyFrequencyConfig | undefined => {
  const targetFrequency = normalizeNumber(channel.target_freq_mhz)
  if (targetFrequency !== null) {
    const configByFrequency = configs.find(
      (config) => normalizeNumber(config.target_freq_mhz) === targetFrequency,
    )
    if (configByFrequency) {
      return configByFrequency
    }
  }

  return configs[channel.channel_no - 1]
}

const hasModuleData = (module: BoardModule) =>
  (module.channels || []).some(
    (channel) =>
      channel.configured ||
      normalizeNumber(channel.target_freq_mhz) !== null ||
      normalizeNumber(channel.metric_value) !== null ||
      normalizeNumber(channel.power_w) !== null ||
      normalizeNumber(channel.rssi_dbm) !== null,
  )

const fetchDeviceConfigMap = async (deviceIds: number[]) => {
  const uniqueDeviceIds = Array.from(new Set(deviceIds.filter((deviceId) => deviceId > 0)))
  const configEntries = await Promise.all(
    uniqueDeviceIds.flatMap((deviceId) =>
      MODULE_DIRECTIONS.map(async (direction) => {
        const configRes = await Services.api.postLibiioDeviceConfigList(
          {
            page: 1,
            limit: 200,
            device_id: deviceId,
            direction,
          },
          {
            showLoading: false,
            showToast: false,
          },
        )

        return [
          getConfigMapKey(deviceId, direction),
          sortConfigs(configRes?.res?.list || []),
        ] as const
      }),
    ),
  )

  return Object.fromEntries(configEntries) as Record<string, LegacyFrequencyConfig[]>
}

const mergeBoardDevicesWithConfigs = (
  devices: BoardDevice[],
  configMap: Record<string, LegacyFrequencyConfig[]>,
): BoardDevice[] =>
  devices.map((device) => ({
    ...device,
    modules: (device.modules || []).map((module) => ({
      ...module,
      metric_unit: module.metric_unit || (module.direction === "tx" ? "W" : "dBm"),
      channels: (module.channels || []).slice(0, MAX_CHANNEL_COUNT).map((channel) => {
        const configs = configMap[getConfigMapKey(device.device_id, module.direction)] || []
        const config = getConfigByChannel(channel, configs)
        const metricValue = getMetricValue(channel, module.direction, config)

        return {
          ...channel,
          configured: channel.configured || Boolean(config),
          target_freq_mhz: channel.target_freq_mhz ?? config?.target_freq_mhz ?? null,
          metric_value: metricValue,
          alarm_enabled: config?.is_alarm ?? 0,
          alarm_status: null,
          status_text: undefined,
          min: config?.min,
          max: config?.max,
          power_w: module.direction === "tx" ? channel.power_w ?? config?.power_w : undefined,
          rssi_dbm: module.direction === "rx" ? channel.rssi_dbm ?? config?.rssi_dbm : undefined,
        }
      }),
    })),
  }))

const buildLegacyBoardDevices = (
  devices: LegacyLibiioDevice[],
  configMap: Record<string, LegacyFrequencyConfig[]>,
): BoardDevice[] =>
  devices.map((device) => ({
    device_id: device.id,
    ip: device.ip,
    modules: MODULE_DIRECTIONS.map((direction) => ({
      direction,
      ip: direction === "tx" ? device.tx_ip : device.rx_ip,
      metric_unit: direction === "tx" ? "W" : "dBm",
      channels: (configMap[getConfigMapKey(device.id, direction)] || [])
        .slice(0, MAX_CHANNEL_COUNT)
        .map((config, index) => {
          const metricValue = getMetricValue({}, direction, config)

          return {
            channel_no: index + 1,
            configured: true,
            target_freq_mhz: config.target_freq_mhz,
            metric_value: metricValue,
            alarm_enabled: config.is_alarm,
            alarm_status: null,
            min: config.min,
            max: config.max,
            power_w: direction === "tx" ? config.power_w : undefined,
            rssi_dbm: direction === "rx" ? config.rssi_dbm : undefined,
          }
        }),
    })),
  }))

const chunkItems = <T extends { channel_no: number }>(items: T[], size: number) => {
  const result: FrequencyChunk<T>[] = []
  for (let index = 0; index < items.length; index += size) {
    const chunk = items.slice(index, index + size)
    result.push({
      key: chunk.map((item) => item.channel_no).join("-"),
      channelOffset: index,
      items: chunk,
    })
  }
  return result.length
    ? result
    : [
        {
          key: "empty",
          channelOffset: 0,
          items: [],
        },
      ]
}

const fetchLegacyBoardDevices = async () => {
  const deviceRes = await Services.api.postLibiioDeviceList(
    {
      page: 1,
      limit: MAX_FETCH_SIZE,
    },
    {
      showLoading: false,
      showToast: false,
    },
  )
  const deviceList = (deviceRes?.res?.list || []).sort((prev, next) => {
    if ((prev.type || 0) === (next.type || 0)) {
      return prev.id - next.id
    }
    return (prev.type || 0) - (next.type || 0)
  })
  const configMap = await fetchDeviceConfigMap(deviceList.map((device) => device.id))

  return buildLegacyBoardDevices(deviceList, configMap)
}

const FrequencyBoardPage: React.FC = () => {
  const intl = useIntl()
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState<BoardDevice[]>([])
  const t = useCallback(
    (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
      intl.formatMessage({ id, defaultMessage }, values),
    [intl],
  )

  const directionLabelMap = useMemo<Record<ModuleDirection, string>>(
    () => ({
      rx: t("app.device.libiio.module.rx", "RX Module"),
      tx: t("app.device.libiio.module.tx", "TX Module"),
    }),
    [t],
  )

  const getMetricUnit = useCallback(
    (module: BoardModule) => module.metric_unit || (module.direction === "tx" ? "W" : "dBm"),
    [],
  )

  const getMetricLabel = useCallback(
    (module: BoardModule) => {
      const metricLabel =
        module.metric_label ||
        (module.direction === "tx"
          ? t("app.device.libiio.txMonitorPowerWithUnit", "Power (W)")
          : t("app.device.libiio.rxRssiWithUnit", "RSSI (dBm)"))
      const metricUnit = getMetricUnit(module)

      if (metricUnit && !metricLabel.includes(metricUnit)) {
        return `${metricLabel} (${metricUnit})`
      }

      return metricLabel
    },
    [getMetricUnit, t],
  )

  const getChannelStatus = useCallback(
    (channel: BoardChannel) => {
      if (!channel.configured || !isAlarmEnabled(channel.alarm_enabled ?? channel.is_alarm)) {
        return { text: "-", tone: "none" as StatusTone }
      }

      const metricValue = normalizeNumber(channel.metric_value)
      if (metricValue === null) {
        return { text: "-", tone: "none" as StatusTone }
      }

      const max = normalizeNumber(channel.max)
      if (max !== null && metricValue > max) {
        return { text: t("app.device.libiio.board.statusHigh", "High"), tone: "high" as StatusTone }
      }

      const min = normalizeNumber(channel.min)
      if (min !== null && metricValue < min) {
        return { text: t("app.device.libiio.board.statusLow", "Low"), tone: "low" as StatusTone }
      }

      return {
        text: t("app.device.libiio.board.statusNormal", "Normal"),
        tone: "normal" as StatusTone,
      }
    },
    [t],
  )

  const buildDisplayRows = useCallback(
    (chunk: BoardChannel[], metricLabel: string, metricUnit: string) => {
      const rows: DisplayRow[] = [
        {
          label: t("app.device.libiio.board.frequency", "Frequency"),
          values: chunk.map((item) => formatFrequency(item.target_freq_mhz)),
        },
      ]

      rows.push({
        label: metricLabel,
        values: chunk.map((item) => formatMetricValue(item.metric_value, ` ${metricUnit}`)),
      })

      const statuses = chunk.map((item) => getChannelStatus(item))
      rows.push({
        label: t("app.device.libiio.board.status", "Status"),
        values: statuses.map((item) => item.text),
        statusTones: statuses.map((item) => item.tone),
      })

      return rows
    },
    [getChannelStatus, t],
  )

  const loadBoardData = useCallback(async () => {
    try {
      setLoading(true)
      try {
        const boardRes = await Services.api.postLibiioBoardList(
          {
            page: 1,
            limit: MAX_FETCH_SIZE,
            directions: MODULE_DIRECTIONS,
          },
          {
            showLoading: false,
            showToast: false,
          },
        )
        const boardList = boardRes?.res?.list || []
        const hasBoardData = boardList.some((device) => (device.modules || []).length)
        if (hasBoardData) {
          const configMap = await fetchDeviceConfigMap(boardList.map((device) => device.device_id))
          setDevices(mergeBoardDevicesWithConfigs(boardList, configMap))
          return
        }
      } catch (error) {
        console.warn("获取聚合频点数据失败，回退到旧接口拼接:", error)
      }

      setDevices(await fetchLegacyBoardDevices())
    } catch (error) {
      console.error("获取频点数据页失败:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBoardData()
  }, [loadBoardData])

  const boardSections = useMemo<BoardSection[]>(
    () =>
      devices.flatMap((device) =>
        BOARD_MODULE_ORDER.map((direction) =>
          (device.modules || []).find((module) => module.direction === direction),
        )
          .filter((module): module is BoardModule => Boolean(module))
          .filter(hasModuleData)
          .map((module) => ({
            key: `${device.device_id}-${module.direction}`,
            device,
            direction: module.direction,
            directionLabel: module.title || directionLabelMap[module.direction],
            moduleIp: module.ip,
            metricLabel: getMetricLabel(module),
            metricUnit: getMetricUnit(module),
            chunks: chunkItems(normalizeChannels(module.channels), CHANNELS_PER_ROW),
          })),
      ),
    [devices, directionLabelMap, getMetricLabel, getMetricUnit],
  )

  return (
    <PageContainer className="libiio-board-page" title={false}>
      <Card className="libiio-board-shell">
        <Spin spinning={loading}>
          {boardSections.length ? (
            <div className="libiio-board-list">
              {boardSections.map(
                ({
                  key,
                  device,
                  direction,
                  directionLabel,
                  moduleIp,
                  metricLabel,
                  metricUnit,
                  chunks,
                }) => (
                  <section className="libiio-board-section" key={key}>
                    <div className="libiio-board-section__title">{directionLabel}</div>
                    <div className="libiio-board-section__meta">
                      {moduleIp ||
                        device.ip ||
                        t("app.device.libiio.board.deviceWithId", "Device #{id}", {
                          id: device.device_id,
                        })}
                    </div>

                    <div className="libiio-board-table-wrap">
                      <table className="libiio-board-table">
                        <tbody>
                          {chunks.map((chunk) => (
                            <React.Fragment key={`${device.device_id}-${chunk.key}`}>
                              <tr className="libiio-board-table__channel-row">
                                <th>{t("app.device.libiio.board.channel", "Channel")}</th>
                                {CHANNEL_COLUMNS.map((channelNumber) => (
                                  <th
                                    key={`${device.device_id}-${chunk.key}-channel-${channelNumber}`}
                                  >
                                    {t(
                                      "app.device.libiio.board.channelWithNumber",
                                      "Channel {number}",
                                      {
                                        number: chunk.channelOffset + channelNumber,
                                      },
                                    )}
                                  </th>
                                ))}
                              </tr>

                              {buildDisplayRows(chunk.items, metricLabel, metricUnit).map((row) => (
                                <tr
                                  key={`${device.device_id}-${direction}-${chunk.key}-${row.label}`}
                                >
                                  <td className="libiio-board-table__row-label">{row.label}</td>
                                  {CHANNEL_COLUMNS.map((channelNumber) => (
                                    <td
                                      key={`${device.device_id}-${direction}-${chunk.key}-${row.label}-${channelNumber}`}
                                    >
                                      <span
                                        className={getStatusClassName(
                                          row.statusTones?.[channelNumber - 1],
                                        )}
                                      >
                                        {row.values[channelNumber - 1] || "-"}
                                      </span>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ),
              )}
            </div>
          ) : (
            <Empty description={t("app.device.libiio.board.empty", "No frequency data")} />
          )}
        </Spin>
      </Card>
    </PageContainer>
  )
}

export default FrequencyBoardPage

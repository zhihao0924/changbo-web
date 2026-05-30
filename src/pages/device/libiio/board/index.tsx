import { PageContainer } from "@ant-design/pro-components"
import { Card, Empty, Spin } from "antd"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useIntl } from "umi"
import Services from "@/pages/device/services"
import type { API_PostLibiioBoardList } from "@/pages/device/services/typings/device"
import { formatBackendLabel } from "@/utils/i18n"
import "./index.less"

type ModuleDirection = "rx" | "tx"
type BoardDevice = API_PostLibiioBoardList.List
type BoardModule = API_PostLibiioBoardList.Module
type BoardChannel = API_PostLibiioBoardList.Channel
type BoardSection = {
  key: string
  device: BoardDevice
  direction: ModuleDirection
  directionLabel: string
  moduleIp?: string
  metricLabel: string
  metricUnit: string
  isOffline: boolean
  chunks: FrequencyChunk<BoardChannel>[]
}

const CHANNELS_PER_ROW = 10
const CHANNEL_COLUMNS = Array.from({ length: CHANNELS_PER_ROW }, (_, index) => index + 1)
const MAX_CHANNEL_COUNT = 20
const BOARD_POLLING_INTERVAL = 3000
const BOARD_MODULE_ORDER: ModuleDirection[] = ["tx", "rx"]
const ALARM_DISABLED_VALUE = -1
type FrequencyChunk<T> = { key: string; channelOffset: number; items: T[] }
type StatusTone = "normal" | "high" | "low" | "none"
type DisplayRow = { label: string; values: string[]; statusTones?: StatusTone[] }

const toFiniteNumberOrNull = (value?: number | string | null) => {
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

const isOfflineValue = (value?: number | string | boolean | null) => {
  if (value === false || value === 0 || value === "0") {
    return true
  }

  return (
    typeof value === "string" && ["false", "offline", "离线"].includes(value.trim().toLowerCase())
  )
}

const formatFrequency = (value?: number | string | null) => {
  const numberValue = toFiniteNumberOrNull(value)
  return numberValue !== null ? `${numberValue} MHz` : "-"
}

const formatMetricValue = (value?: number | string | null, suffix?: string) => {
  const numberValue = toFiniteNumberOrNull(value)
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

const fillMissingChannels = (channels: BoardChannel[] = []) => {
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
        alarm_enabled: ALARM_DISABLED_VALUE,
        alarm_status: null,
        status_text: "-",
      }
    )
  })
}

const getChannelMetricValue = (channel: BoardChannel, direction: ModuleDirection) =>
  direction === "tx"
    ? toFiniteNumberOrNull(channel.power_w)
    : toFiniteNumberOrNull(channel.rssi_dbm ?? channel.metric_value)

const hasModuleData = (module: BoardModule) =>
  (module.channels || []).some(
    (channel) =>
      channel.configured ||
      toFiniteNumberOrNull(channel.target_freq_mhz) !== null ||
      toFiniteNumberOrNull(channel.metric_value) !== null ||
      toFiniteNumberOrNull(channel.power_w) !== null ||
      toFiniteNumberOrNull(channel.rssi_dbm) !== null,
  )

const isModuleOffline = (module: BoardModule) => {
  const onlineValue = module.is_online ?? module.online
  if (onlineValue !== undefined && onlineValue !== null) {
    return isOfflineValue(onlineValue)
  }

  const statusText = (module.status || module.status_key || module.status_text)?.trim().toLowerCase()
  if (statusText) {
    return statusText.includes("offline") || statusText.includes("离线")
  }

  return !hasModuleData(module)
}

const buildBoardDevices = (devices: BoardDevice[]): BoardDevice[] =>
  devices.map((device) => ({
    ...device,
    modules: (device.modules || []).map((module) => ({
      ...module,
      metric_unit: module.metric_unit || (module.direction === "tx" ? "W" : "dBm"),
      channels: (module.channels || []).slice(0, MAX_CHANNEL_COUNT),
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

const FrequencyBoardPage: React.FC = () => {
  const intl = useIntl()
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState<BoardDevice[]>([])
  const loadingRef = useRef(false)
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
        formatBackendLabel(
          {
            key: module.metric_label_key || module.metric_key,
            fallback: module.metric_label,
          },
          t,
        ) ||
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
    (channel: BoardChannel, direction: ModuleDirection) => {
      if (!channel.configured || !isAlarmEnabled(channel.alarm_enabled ?? channel.is_alarm)) {
        return { text: "-", tone: "none" as StatusTone }
      }

      const metricValue = getChannelMetricValue(channel, direction)
      if (metricValue === null) {
        return { text: "-", tone: "none" as StatusTone }
      }

      const max = toFiniteNumberOrNull(channel.max)
      if (max !== null && metricValue > max) {
        return { text: t("app.device.libiio.board.statusHigh", "High"), tone: "high" as StatusTone }
      }

      const min = toFiniteNumberOrNull(channel.min)
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
    (
      direction: ModuleDirection,
      chunk: BoardChannel[],
      metricLabel: string,
      metricUnit: string,
    ) => {
      const rows: DisplayRow[] = [
        {
          label: t("app.device.libiio.board.frequency", "Frequency"),
          values: chunk.map((item) => formatFrequency(item.target_freq_mhz)),
        },
      ]

      rows.push({
        label: metricLabel,
        values: chunk.map((item) =>
          formatMetricValue(getChannelMetricValue(item, direction), ` ${metricUnit}`),
        ),
      })

      const statuses = chunk.map((item) => getChannelStatus(item, direction))
      rows.push({
        label: t("app.device.libiio.board.status", "Status"),
        values: statuses.map((item) => item.text),
        statusTones: statuses.map((item) => item.tone),
      })

      return rows
    },
    [getChannelStatus, t],
  )

  const loadBoardData = useCallback(async (silent = false) => {
    if (loadingRef.current) {
      return
    }

    loadingRef.current = true

    try {
      if (!silent) {
        setLoading(true)
      }

      const boardRes = await Services.api.postLibiioBoardList(
        {},
        {
          showLoading: false,
          showToast: false,
        },
      )
      setDevices(buildBoardDevices(boardRes?.res?.list || []))
    } catch (error) {
    } finally {
      loadingRef.current = false
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadBoardData(false)
    const timer = window.setInterval(() => {
      loadBoardData(true)
    }, BOARD_POLLING_INTERVAL)

    return () => {
      window.clearInterval(timer)
    }
  }, [loadBoardData])

  const boardSections = useMemo<BoardSection[]>(
    () =>
      devices.flatMap((device) =>
        BOARD_MODULE_ORDER.map((direction) => {
          const module =
            (device.modules || []).find((item) => item.direction === direction) ||
            ({
              direction,
              channels: [],
              metric_unit: direction === "tx" ? "W" : "dBm",
            } as BoardModule)

          return {
            key: `${device.device_id}-${module.direction}`,
            device,
            direction: module.direction,
            directionLabel:
              formatBackendLabel({ key: module.title_key, fallback: module.title }, t) ||
              directionLabelMap[module.direction],
            moduleIp: module.ip,
            metricLabel: getMetricLabel(module),
            metricUnit: getMetricUnit(module),
            isOffline: isModuleOffline(module),
            chunks: chunkItems(fillMissingChannels(module.channels), CHANNELS_PER_ROW),
          }
        }),
      ),
    [devices, directionLabelMap, getMetricLabel, getMetricUnit, t],
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
                  isOffline,
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

                    {isOffline ? (
                      <div className="libiio-board-offline">
                        {t("app.device.status.moduleOffline", "Module Offline")}
                      </div>
                    ) : (
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

                                {buildDisplayRows(
                                  direction,
                                  chunk.items,
                                  metricLabel,
                                  metricUnit,
                                ).map((row) => (
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
                    )}
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

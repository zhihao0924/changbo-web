import { PageContainer } from "@ant-design/pro-components"
import { Card, Empty, Spin } from "antd"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useIntl } from "umi"
import Services from "@/pages/device/services"
import type {
  API_PostLibiioDeviceConfigList,
  API_PostLibiioDeviceList,
} from "@/pages/device/services/typings/device"
import "./index.less"

type LibiioDevice = API_PostLibiioDeviceList.List
type FrequencyConfig = API_PostLibiioDeviceConfigList.ConfigItem
type ModuleDirection = "rx" | "tx"
type BoardSection = {
  key: string
  device: LibiioDevice
  direction: ModuleDirection
  directionLabel: string
  chunks: FrequencyChunk<FrequencyConfig>[]
}

const MAX_FETCH_SIZE = 1000
const CHANNELS_PER_ROW = 10
const CHANNEL_COLUMNS = Array.from({ length: CHANNELS_PER_ROW }, (_, index) => index + 1)
type FrequencyChunk<T> = { key: string; channelOffset: number; items: T[] }
type DisplayRow = { label: string; values: string[]; accent?: boolean }

const formatFrequency = (value?: number) => (typeof value === "number" ? `${value} MHz` : "-")

const formatMetricValue = (value?: number, suffix?: string) =>
  typeof value === "number" ? `${value}${suffix || ""}` : "-"

const sortConfigs = <T extends { sort?: number; id?: number }>(items: T[]) =>
  [...items].sort((prev, next) => {
    const prevSort = typeof prev.sort === "number" ? prev.sort : Number.MAX_SAFE_INTEGER
    const nextSort = typeof next.sort === "number" ? next.sort : Number.MAX_SAFE_INTEGER

    if (prevSort !== nextSort) {
      return prevSort - nextSort
    }

    return (prev.id || 0) - (next.id || 0)
  })

const chunkItems = <T extends { id?: number }>(items: T[], size: number) => {
  const result: FrequencyChunk<T>[] = []
  for (let index = 0; index < items.length; index += size) {
    const chunk = items.slice(index, index + size)
    result.push({
      key: chunk.map((item) => item.id || `channel-${index}`).join("-"),
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
  const [devices, setDevices] = useState<LibiioDevice[]>([])
  const [configMap, setConfigMap] = useState<Record<string, FrequencyConfig[]>>({})
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

  const formatStatusText = useCallback(
    (value?: number) =>
      value === 1
        ? t("app.device.libiio.board.statusAbnormal", "Abnormal")
        : t("app.device.libiio.board.statusNormal", "Normal"),
    [t],
  )

  const buildDisplayRows = useCallback(
    (direction: ModuleDirection, chunk: FrequencyConfig[]) => {
      const rows: DisplayRow[] = [
        {
          label: t("app.device.libiio.board.frequency", "Frequency"),
          values: chunk.map((item) => formatFrequency(item.target_freq_mhz)),
        },
      ]

      rows.push({
        label:
          direction === "tx"
            ? t("app.device.libiio.fsDbm", "FS (dBm)")
            : t("app.device.libiio.rxGain", "RX Gain"),
        values: chunk.map((item) =>
          formatMetricValue(item.fix_val, direction === "tx" ? " dBm" : ""),
        ),
      })
      rows.push({
        label: t("app.device.libiio.board.status", "Status"),
        values: chunk.map((item) => formatStatusText(item.is_alarm)),
        accent: true,
      })

      return rows
    },
    [formatStatusText, t],
  )

  const loadBoardData = useCallback(async () => {
    try {
      setLoading(true)
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

      setDevices(deviceList)

      const configEntries = await Promise.all(
        deviceList.flatMap((device) =>
          (["rx", "tx"] as ModuleDirection[]).map(async (direction) => {
            const configRes = await Services.api.postLibiioDeviceConfigList(
              {
                page: 1,
                limit: 200,
                device_id: device.id,
                direction,
              },
              {
                showLoading: false,
                showToast: false,
              },
            )

            return [`${device.id}-${direction}`, sortConfigs(configRes?.res?.list || [])] as const
          }),
        ),
      )

      setConfigMap(Object.fromEntries(configEntries))
    } catch (error) {
      console.error("获取频点数据页失败:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBoardData()
  }, [loadBoardData])

  const normalText = t("app.device.libiio.board.statusNormal", "Normal")
  const boardSections = useMemo<BoardSection[]>(
    () =>
      devices.flatMap((device) =>
        (["rx", "tx"] as ModuleDirection[]).map((direction) => ({
          key: `${device.id}-${direction}`,
          device,
          direction,
          directionLabel: directionLabelMap[direction],
          chunks: chunkItems(configMap[`${device.id}-${direction}`] || [], CHANNELS_PER_ROW),
        })),
      ),
    [configMap, devices, directionLabelMap],
  )

  return (
    <PageContainer className="libiio-board-page" title={false}>
      <Card className="libiio-board-shell">
        <Spin spinning={loading}>
          {boardSections.length ? (
            <div className="libiio-board-list">
              {boardSections.map(({ key, device, direction, directionLabel, chunks }) => (
                <section className="libiio-board-section" key={key}>
                  <div className="libiio-board-section__title">{directionLabel}</div>
                  <div className="libiio-board-section__meta">
                    {device.ip ||
                      t("app.device.libiio.board.deviceWithId", "Device #{id}", { id: device.id })}
                  </div>

                  <div className="libiio-board-table-wrap">
                    <table className="libiio-board-table">
                      <tbody>
                        {chunks.map((chunk) => (
                          <React.Fragment key={`${device.id}-${chunk.key}`}>
                            <tr className="libiio-board-table__channel-row">
                              <th>{t("app.device.libiio.board.channel", "Channel")}</th>
                              {CHANNEL_COLUMNS.map((channelNumber) => (
                                <th key={`${device.id}-${chunk.key}-channel-${channelNumber}`}>
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

                            {buildDisplayRows(direction, chunk.items).map((row) => (
                              <tr key={`${device.id}-${direction}-${chunk.key}-${row.label}`}>
                                <td className="libiio-board-table__row-label">{row.label}</td>
                                {CHANNEL_COLUMNS.map((channelNumber) => (
                                  <td
                                    key={`${device.id}-${direction}-${chunk.key}-${row.label}-${channelNumber}`}
                                  >
                                    <span
                                      className={
                                        row.accent
                                          ? row.values[channelNumber - 1] === normalText
                                            ? "libiio-board-table__accent-open"
                                            : "libiio-board-table__accent-close"
                                          : ""
                                      }
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
              ))}
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

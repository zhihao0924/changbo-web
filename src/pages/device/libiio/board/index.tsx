import { PageContainer } from "@ant-design/pro-components"
import { Card, Empty, Spin } from "antd"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import Services from "@/pages/device/services"
import type {
  API_PostLibiioDeviceConfigList,
  API_PostLibiioDeviceList,
} from "@/pages/device/services/typings/device"
import "./index.less"

type LibiioDevice = API_PostLibiioDeviceList.List
type FrequencyConfig = API_PostLibiioDeviceConfigList.ConfigItem

const MAX_FETCH_SIZE = 1000
const CHANNELS_PER_ROW = 10
const CHANNEL_COLUMNS = Array.from({ length: CHANNELS_PER_ROW }, (_, index) => index + 1)
type FrequencyChunk<T> = { key: string; channelOffset: number; items: T[] }
const DEVICE_TYPE_LABEL_MAP: Record<number, string> = {
  1: "TX发射功率",
  2: "RX接收RSSI",
}

const formatTypeLabel = (type?: number) =>
  (typeof type === "number" && DEVICE_TYPE_LABEL_MAP[type]) || "未分类频点"

const formatFrequency = (value?: number) => (typeof value === "number" ? `${value} MHz` : "-")

const formatMetricValue = (value?: number, suffix?: string) =>
  typeof value === "number" ? `${value}${suffix || ""}` : "-"

const formatStatusText = (value?: number) => (value === 1 ? "异常" : "正常")

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

const buildDisplayRows = (device: LibiioDevice, chunk: FrequencyConfig[]) => {
  const rows = [
    {
      label: "频率",
      values: chunk.map((item) => formatFrequency(item.target_freq_mhz)),
    },
  ]

  if (device.type === 1) {
    rows.push({
      label: "功率",
      values: chunk.map((item) => formatMetricValue(item.fs_dbm, " dBm")),
    })
    rows.push({
      label: "状态",
      values: chunk.map((item) => formatStatusText(item.is_alarm)),
      accent: true,
    })
  } else {
    rows.push({
      label: "功率",
      values: chunk.map((item) => formatMetricValue(item.rx_gain)),
    })
    rows.push({
      label: "状态",
      values: chunk.map((item) => formatStatusText(item.is_alarm)),
      accent: true,
    })
  }

  return rows
}

const FrequencyBoardPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState<LibiioDevice[]>([])
  const [configMap, setConfigMap] = useState<Record<number, FrequencyConfig[]>>({})

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
        deviceList.map(async (device) => {
          const configRes = await Services.api.postLibiioDeviceConfigList(
            {
              page: 1,
              limit: 200,
              device_id: device.id,
            },
            {
              showLoading: false,
              showToast: false,
            },
          )

          return [device.id, sortConfigs(configRes?.res?.list || [])] as const
        }),
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

  const boardSections = useMemo(
    () =>
      devices.map((device) => ({
        device,
        chunks: chunkItems(configMap[device.id] || [], CHANNELS_PER_ROW),
      })),
    [configMap, devices],
  )

  return (
    <PageContainer className="libiio-board-page" title={false}>
      <Card className="libiio-board-shell">
        <Spin spinning={loading}>
          {boardSections.length ? (
            <div className="libiio-board-list">
              {boardSections.map(({ device, chunks }) => (
                <section className="libiio-board-section" key={device.id}>
                  <div className="libiio-board-section__title">{formatTypeLabel(device.type)}</div>
                  <div className="libiio-board-section__meta">
                    {device.ip || `设备 #${device.id}`}
                  </div>

                  <div className="libiio-board-table-wrap">
                    <table className="libiio-board-table">
                      <tbody>
                        {chunks.map((chunk) => (
                          <React.Fragment key={`${device.id}-${chunk.key}`}>
                            <tr className="libiio-board-table__channel-row">
                              <th>信道</th>
                              {CHANNEL_COLUMNS.map((channelNumber) => (
                                <th key={`${device.id}-${chunk.key}-channel-${channelNumber}`}>
                                  信道{chunk.channelOffset + channelNumber}
                                </th>
                              ))}
                            </tr>

                            {buildDisplayRows(device, chunk.items).map((row) => (
                              <tr key={`${device.id}-${chunk.key}-${row.label}`}>
                                <td className="libiio-board-table__row-label">{row.label}</td>
                                {CHANNEL_COLUMNS.map((channelNumber) => (
                                  <td
                                    key={`${device.id}-${chunk.key}-${row.label}-${channelNumber}`}
                                  >
                                    <span
                                      className={
                                        row.accent
                                          ? row.values[channelNumber - 1] === "正常"
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
            <Empty description="暂无频点数据" />
          )}
        </Spin>
      </Card>
    </PageContainer>
  )
}

export default FrequencyBoardPage

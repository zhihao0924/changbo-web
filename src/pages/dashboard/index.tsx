import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { PageContainer } from "@ant-design/pro-components"
import { Card, Row, Col, Typography, Button, Space, Image, List } from "antd"
import { Line, Pie } from "@ant-design/charts"
import styles from "./index.less"
import Services from "@/pages/dashboard/services"
import {
  WarningOutlined,
  AlertOutlined,
  AreaChartOutlined,
  CodeSandboxOutlined,
  RiseOutlined,
  ProductOutlined,
} from "@ant-design/icons"
import { SYSTEM_CONFIG } from "@/constants"

const { Title } = Typography

// 常量配置
const DASHBOARD_CONFIG = {
  refreshInterval: () => {
    try {
      const systemConfig = localStorage.getItem(SYSTEM_CONFIG)
      if (systemConfig) {
        const config = JSON.parse(systemConfig)
        return config.refresh_interval || 3000 // 默认3秒
      }
    } catch (error) {
      console.error("获取系统配置失败:", error)
    }
    return 3000 // 默认3秒
  },
  beepInterval: 1000, // 1秒播放一次滴滴声
  chartColors: ["#376DF7", "#00B5FF", "#FFB600", "#FF5900", "#999999"],
  lineChartColor: "#0083FF",
}

// 自定义Hook：滴滴声功能
const useBeep = (alarmDeviceCount: number = 0) => {
  const beepIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [isBeeping, setIsBeeping] = useState(false)

  // 初始化音频上下文
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log("音频上下文已创建")
    }
    return audioContextRef.current
  }, [])

  // 播放滴滴声
  const playBeep = useCallback(() => {
    // 只有在有告警设备时才播放声音
    if (alarmDeviceCount <= 0) {
      console.log("没有告警设备，跳过播放")
      return
    }

    console.log("尝试播放滴滴声，告警设备数量:", alarmDeviceCount)

    try {
      const audioContext = getAudioContext()

      // 尝试自动激活音频上下文
      if (audioContext.state === "suspended") {
        console.log("音频上下文被暂停，尝试自动激活")

        // 方法1: 尝试直接恢复
        audioContext
          .resume()
          .then(() => {
            console.log("音频上下文自动激活成功")
            // 激活后立即播放一次滴滴声
            playBeep()
          })
          .catch((error) => {
            console.log("自动激活失败，尝试其他方法:", error)

            // 方法2: 模拟用户交互
            const clickEvent = new MouseEvent("click", {
              view: window,
              bubbles: true,
              cancelable: true,
            })

            // 尝试在文档上触发点击事件
            document.dispatchEvent(clickEvent)

            // 再次尝试恢复
            setTimeout(() => {
              audioContext
                .resume()
                .then(() => {
                  console.log("通过模拟点击激活音频上下文")
                  playBeep()
                })
                .catch(console.error)
            }, 100)
          })

        return
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"
      gainNode.gain.value = 0.1

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)

      console.log("滴滴声播放成功")

      // 清理资源
      setTimeout(() => {
        oscillator.disconnect()
        gainNode.disconnect()
      }, 200)
    } catch (error) {
      console.error("播放滴滴声失败:", error)

      // 尝试使用HTML5 Audio作为备选方案
      try {
        const beepSound = new Audio(
          "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA",
        )
        beepSound.volume = 0.1

        // 尝试自动播放，如果失败则静音播放
        beepSound.play().catch(() => {
          console.log("HTML5 Audio自动播放被阻止，尝试静音播放")
          beepSound.muted = true
          beepSound
            .play()
            .then(() => {
              console.log("静音播放成功")
              // 播放后取消静音
              setTimeout(() => {
                beepSound.muted = false
              }, 100)
            })
            .catch(console.error)
        })

        console.log("使用HTML5 Audio播放滴滴声")
      } catch (fallbackError) {
        console.error("备选方案也失败:", fallbackError)
      }
    }
  }, [alarmDeviceCount, getAudioContext])

  // 开始定时播放
  const startBeep = useCallback(() => {
    if (beepIntervalRef.current) clearInterval(beepIntervalRef.current)

    console.log("尝试启动滴滴声定时器，告警设备数量:", alarmDeviceCount)

    // 设置滴滴声状态为开启
    setIsBeeping(true)

    // 只有在有告警设备时才启动定时器播放声音
    if (alarmDeviceCount > 0) {
      beepIntervalRef.current = setInterval(playBeep, DASHBOARD_CONFIG.beepInterval)
      console.log("滴滴声定时器已启动，间隔:", DASHBOARD_CONFIG.beepInterval, "ms")

      // 立即播放一次滴滴声
      setTimeout(playBeep, 100)
    } else {
      console.log("没有告警设备，滴滴声状态已开启但不会播放声音")
    }
  }, [playBeep, alarmDeviceCount])

  // 停止播放
  const stopBeep = useCallback(() => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current)
      beepIntervalRef.current = null
    }
    setIsBeeping(false)
  }, [])

  // 切换状态
  const toggleBeep = useCallback(() => {
    if (isBeeping) {
      stopBeep()
    } else {
      // 用户手动开启滴滴声，状态可以开启，但只有有告警设备时才播放声音
      startBeep()
    }
  }, [isBeeping, startBeep, stopBeep])

  // 当告警设备数量变化时自动处理滴滴声
  useEffect(() => {
    console.log("告警设备数量变化:", alarmDeviceCount, "滴滴声状态:", isBeeping)

    if (isBeeping) {
      if (alarmDeviceCount <= 0) {
        // 如果滴滴声状态开启但没有告警设备，停止定时器但不改变状态
        if (beepIntervalRef.current) {
          clearInterval(beepIntervalRef.current)
          beepIntervalRef.current = null
          console.log("告警设备数量为0，停止滴滴声播放但保持开启状态")
        }
      } else if (alarmDeviceCount > 0) {
        // 如果有告警设备且滴滴声状态开启，则启动定时器播放声音
        if (!beepIntervalRef.current) {
          beepIntervalRef.current = setInterval(playBeep, DASHBOARD_CONFIG.beepInterval)
          console.log("有告警设备且滴滴声状态开启，启动定时器播放声音")
          // 立即播放一次滴滴声
          setTimeout(playBeep, 100)
        }
      }
    }
  }, [alarmDeviceCount, isBeeping, playBeep])

  // 组件挂载时，滴滴声状态默认为关闭
  useEffect(() => {
    console.log("组件挂载，滴滴声状态初始化为关闭")
    setIsBeeping(false)
  }, [])

  // 清理
  useEffect(() => {
    return () => {
      stopBeep()
      if (audioContextRef.current) {
        audioContextRef.current.close()
        console.log("音频上下文已关闭")
      }
    }
  }, [stopBeep])

  return { isBeeping, toggleBeep, startBeep, stopBeep }
}

// 饼图配置
const usePieConfig = (
  data: API_PostDashboard.Statistic | any[],
  total_healthy: number,
  total: number,
  isFirstRender: boolean,
) => {
  return useMemo(() => {
    return {
      data: data || [],
      angleField: "value",
      colorField: "type",
      radius: 0.7,
      innerRadius: 0.6,
      label: {
        type: "inner",
        content: "{value}",
        style: { fontSize: 12, textAlign: "center" },
      },
      color: DASHBOARD_CONFIG.chartColors,
      tooltip: {
        formatter: (item: any) => ({
          name: item.type,
          value: `${item.value} 台 (${((item.value * 100) / (total || 1)).toFixed(2)}%)`,
        }),
      },
      statistic: {
        title: { formatter: () => "健康率", style: { fontSize: 14 } },
        content: {
          style: { fontSize: 12, fontWeight: "bold", color: "#30BF78" },
          content: `${total_healthy.toFixed(2) || 0}%`,
        },
      },
      interactions: [{ type: "element-active" }, { type: "element-selected" }],
      legend: {
        position: "right",
        offsetX: -60,
        itemName: {
          formatter: (text: string, item: any, index: number) => {
            // 设备总数显示在legend中
            if (text === "设备总计") {
              return `总计：${total}`
            }
            // 对于普通数据项，显示对应的值
            const itemData = data?.[index]
            return `${text || ""}: ${itemData?.value || 0}`
          },
        },
        marker: { symbol: "circle", style: { r: 2 } },
        layout: "vertical",
        maxRow: 10,
        maxHeight: 200,
        itemHeight: 8,
        itemSpacing: 2,
        flipPage: false,
        items: [
          ...(data || []).map((item, index) => ({
            value: item.type,
            name: `${item.type || ""}`,
            marker: { symbol: "circle", style: { fill: DASHBOARD_CONFIG.chartColors[index] } },
          })),
          {
            value: total,
            name: `设备总计`,
            marker: { symbol: "circle", style: { fill: "" } },
          },
        ],
      },
      // height: 200,
      animation: isFirstRender,
    }
  }, [data, total_healthy, total, isFirstRender])
}

// 折线图配置
const useLineConfig = (data: any[]) => {
  return useMemo(
    () => ({
      data: data || [],
      xField: "type",
      yField: "value",
      padding: "auto",
      tooltip: {
        formatter: (item: any) => ({
          name: item.type,
          value: `${item.value?.toFixed(2) || 0} wh`,
        }),
      },
      lineStyle: {
        stroke: DASHBOARD_CONFIG.lineChartColor,
        lineWidth: 2,
      },
      smooth: true,
      animation: false,
    }),
    [data],
  )
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<API_PostDashboard.Result>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [currentTowerImage, setCurrentTowerImage] = useState<string>("tower_1")
  const [currentCabinetImage, setCurrentCabinetImage] = useState<string>("cabinet_none")
  const [currentLightImage, setCurrentLightImage] = useState<string>("light_none")

  // 清除告警状态的时间记录（从localStorage读取）
  const [lastClearTime, setLastClearTime] = useState<Date | null>(() => {
    try {
      const storedTime = localStorage.getItem("dashboard_lastClearTime")
      if (storedTime) {
        const parsedTime = new Date(storedTime)
        if (!isNaN(parsedTime.getTime())) {
          console.log("从localStorage读取清除时间:", parsedTime.toISOString())
          return parsedTime
        }
      }
    } catch (err) {
      console.error("读取localStorage清除时间失败:", err)
    }
    return null
  })

  // 更新lastClearTime的函数，同时保存到localStorage
  const setLastClearTimeWithStorage = useCallback((time: Date | null) => {
    setLastClearTime(time)
    if (time) {
      localStorage.setItem("dashboard_lastClearTime", time.toISOString())
      console.log("清除时间已保存到localStorage:", time.toISOString())
    } else {
      localStorage.removeItem("dashboard_lastClearTime")
      console.log("清除时间已从localStorage移除")
    }
  }, [])

  // 计算告警设备数量（新增设备才计数）
  const alarmDeviceCount = useMemo(() => {
    if (!dashboardData?.alarm_device) return 0

    // 如果之前没有清除时间，说明是初次加载，所有告警都计数
    if (!lastClearTime) {
      return dashboardData.alarm_device.length
    }

    // 只计算在清除时间之后出现的告警
    const newAlarmCount = dashboardData.alarm_device.filter((alarm) => {
      if (!alarm.alarm_at) return true

      try {
        const alarmTime = new Date(alarm.alarm_at)
        return alarmTime > lastClearTime
      } catch (err) {
        console.error("解析告警时间失败:", err)
        return true
      }
    }).length

    console.log("总告警设备:", dashboardData.alarm_device.length, "新增告警设备:", newAlarmCount)
    return newAlarmCount
  }, [dashboardData?.alarm_device, lastClearTime])

  const { isBeeping, toggleBeep } = useBeep(alarmDeviceCount)

  // 清除告警功能
  const clearBeep = useCallback(() => {
    const currentTime = new Date()
    setLastClearTimeWithStorage(currentTime)
  }, [setLastClearTimeWithStorage])

  // 获取数据
  const getDashboardData = useCallback(async () => {
    try {
      setError(null)
      const res = await Services.api.postDashboardData({}, { showLoading: false, showToast: false })

      if (res?.res) {
        console.log("Dashboard API Response:", res.res)
        console.log("Total devices:", res.res.total)
        setDashboardData(res.res)
      } else {
        setError("获取数据失败")
      }
    } catch (err) {
      console.error("获取仪表盘数据失败:", err)
      setError("网络请求失败")
    } finally {
      setLoading(false)
    }
  }, [])

  // 定时刷新数据
  useEffect(() => {
    getDashboardData()

    const timer = setInterval(getDashboardData, DASHBOARD_CONFIG.refreshInterval())

    return () => clearInterval(timer)
  }, [getDashboardData])

  // 图片切换配置 - 不同的图片使用不同的切换时间
  const IMAGE_SWITCH_CONFIG = {
    tower: 1000, // 塔台图片切换
    cabinet: 3000, // 机柜图片切换
    light: 300, // 灯光图片切换
  }

  // 塔台图片定时器
  useEffect(() => {
    const towerTimer = setInterval(() => {
      let towerChange = false
      if (
        dashboardData?.transmitter_mixer_downlink_forward_power_signal ||
        dashboardData?.near_end_bs1_downlink_input_power_signal
      ) {
        towerChange = true
      }

      setCurrentTowerImage((prevImage) =>
        towerChange
          ? prevImage === "tower_1"
            ? "tower_2"
            : prevImage === "tower_2"
            ? "tower_3"
            : "tower_1"
          : "tower_3",
      )
    }, IMAGE_SWITCH_CONFIG.tower)

    return () => clearInterval(towerTimer)
  }, [
    dashboardData?.transmitter_mixer_downlink_forward_power_signal,
    dashboardData?.near_end_bs1_downlink_input_power_signal,
    IMAGE_SWITCH_CONFIG.tower,
  ])

  // 机柜图片定时器
  useEffect(() => {
    const cabinetTimer = setInterval(() => {
      let green: boolean = false,
        red: boolean = false
      let cabinetImageName: string = ""
      if (
        dashboardData?.transmitter_mixer_downlink_forward_power_signal ||
        dashboardData?.near_end_bs1_downlink_input_power_signal
      ) {
        green = true
      }

      if (
        dashboardData?.near_end_bs1_uplink_output_rssi_signal ||
        dashboardData?.splitter_rx_output_rssi_signal
      ) {
        red = true
      }

      if (green && red) {
        cabinetImageName = "cabinet_tx_rx"
      } else if (green) {
        cabinetImageName = "cabinet_tx"
      } else if (red) {
        cabinetImageName = "cabinet_rx"
      } else {
        cabinetImageName = "cabinet_none"
      }

      setCurrentCabinetImage((prevImage) =>
        prevImage !== "cabinet_none" ? "cabinet_none" : cabinetImageName,
      )
    }, IMAGE_SWITCH_CONFIG.cabinet)

    return () => clearInterval(cabinetTimer)
  }, [
    dashboardData?.transmitter_mixer_downlink_forward_power_signal,
    dashboardData?.near_end_bs1_downlink_input_power_signal,
    dashboardData?.near_end_bs1_uplink_output_rssi_signal,
    dashboardData?.splitter_rx_output_rssi_signal,
    IMAGE_SWITCH_CONFIG.cabinet,
  ])

  // 灯光图片定时器
  useEffect(() => {
    const lightTimer = setInterval(() => {
      // 根据告警设备状态决定灯光图片和闪烁逻辑

      // 检查是否有告警设备
      const hasAlarms = dashboardData?.alarm_device && dashboardData.alarm_device.length > 0

      // 检查是否有新告警（在清除时间之后出现的告警）
      let hasNewAlarms = false
      let hasHistoryAlarms = false

      if (hasAlarms) {
        // 如果有清除时间，检查告警类型
        if (lastClearTime) {
          dashboardData.alarm_device.forEach((alarm) => {
            if (!alarm.alarm_at) {
              // 没有时间信息的告警视为新告警
              hasNewAlarms = true
            } else {
              try {
                const alarmTime = new Date(alarm.alarm_at)
                if (alarmTime > lastClearTime) {
                  hasNewAlarms = true
                } else {
                  hasHistoryAlarms = true
                }
              } catch (err) {
                console.error("解析告警时间失败:", err)
                hasNewAlarms = true
              }
            }
          })
        } else {
          // 没有清除时间，所有告警都视为新告警
          hasNewAlarms = true
        }
      }

      // 确定灯光状态
      if (hasNewAlarms) {
        // 有新告警：红灯闪烁
        setCurrentLightImage((prevImage) => {
          console.log("有新告警，红灯闪烁", prevImage)
          // 在"关闭"状态和"红灯"状态之间切换实现闪烁
          if (prevImage === "light_none") {
            return "light_red"
          }
          return "light_none"
        })
      } else if (hasHistoryAlarms) {
        // 只有历史告警：稳定红灯，不闪烁
        setCurrentLightImage("light_red")
        console.log("只有历史告警，稳定红灯")
      } else {
        // 无告警：稳定绿灯
        setCurrentLightImage("light_green")
        console.log("无告警，稳定绿灯")
      }
    }, IMAGE_SWITCH_CONFIG.light)

    return () => clearInterval(lightTimer)
  }, [IMAGE_SWITCH_CONFIG.light, dashboardData?.alarm_device, lastClearTime])

  // 处理首次渲染标记
  useEffect(() => {
    if (dashboardData && isFirstRender) {
      setIsFirstRender(false)
    }
  }, [dashboardData, isFirstRender])

  // 图表配置
  const pieConfig = usePieConfig(
    dashboardData?.statistic || [],
    dashboardData?.total_healthy || 0,
    dashboardData?.total || 0,
    isFirstRender,
  )

  const lineConfig = useLineConfig(dashboardData?.energy_consumption || [])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }}>⚡</div>
            <Title level={3} style={{ color: "#595959" }}>
              数据加载中...
            </Title>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>
            <AlertOutlined />
          </div>
          <Title level={3} type="danger">
            数据加载失败
          </Title>
          <p style={{ color: "#595959", marginBottom: 24 }}>{error}</p>
          <Button type="primary" onClick={getDashboardData}>
            重新加载
          </Button>
        </div>
      </div>
    )
  }

  return (
    <PageContainer header={{ breadcrumb: undefined, title: false }}>
      <div className={styles.container}>
        {/* 页面标题和Logo */}

        <Title level={3} style={{ textAlign: "center", margin: 0, flex: 1 }}>
          {(() => {
            try {
              const systemConfig = localStorage.getItem(SYSTEM_CONFIG)
              if (systemConfig) {
                const config = JSON.parse(systemConfig)
                return config.system_name || "专网通信智能网管平台"
              }
            } catch (err) {
              console.error("获取系统配置失败:", err)
            }
            return "专网通信智能网管平台"
          })()}
        </Title>

        {/* 主要数据展示区域 */}
        <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
          {/* 左侧图表区域 */}
          <Col xs={24} lg={6}>
            <Card
              title={
                <Space>
                  <CodeSandboxOutlined style={{ color: "#0083FF" }} />
                  <span>设备健康度</span>
                </Space>
              }
              loading={loading}
              style={{
                marginBottom: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                aspectRatio: "4/3",
                minHeight: 200,
              }}
              bodyStyle={{ padding: "16px", height: "calc(100% - 57px)" }}
              headStyle={{
                fontSize: "12px",
                fontWeight: "600",
                height: "24px",
                borderBottom: "none",
              }}
            >
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pie {...pieConfig} />
              </div>
            </Card>
            <Card
              title={
                <Space>
                  <AreaChartOutlined style={{ color: "#0083FF" }} />
                  <span>能耗统计</span>
                </Space>
              }
              loading={loading}
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                aspectRatio: "4/3",
                minHeight: 200,
              }}
              bodyStyle={{ padding: "16px", height: "calc(100% - 57px)" }}
              headStyle={{
                fontSize: "12px",
                fontWeight: "600",
                height: "24px",
                borderBottom: "none",
              }}
            >
              <div style={{ height: "100%" }}>
                <Line {...lineConfig} />
              </div>
            </Card>
          </Col>

          {/* 中间图片展示区域 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <CodeSandboxOutlined style={{ color: "#0083FF" }} />
                  <span>设备状态预览</span>
                </Space>
              }
              loading={loading}
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                aspectRatio: "4/3",
                minHeight: 416,
              }}
              bodyStyle={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start", // 改为flex-start，允许图片自由下移
                overflow: "hidden",
              }}
              headStyle={{
                fontSize: "12px",
                fontWeight: "600",
                height: "24px",
                borderBottom: "none",
              }}
            >
              {/* 左右布局的图片区域 */}
              <div
                style={{
                  display: "flex",
                  height: "80%",
                  gap: "16px",
                  alignItems: "flex-end",
                  position: "relative",
                }}
              >
                {/* 左边：机柜设备图片（调整为更小尺寸） */}
                <div
                  style={{
                    flex: 0.5, // 减少左边容器的占比
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    height: "40%", // 进一步降低高度
                    minHeight: "40%",
                  }}
                >
                  <Image
                    src={`/assets/${currentCabinetImage}.svg`}
                    preview={false}
                    style={{
                      width: "80%", // 减少图片宽度
                      height: "auto",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                {/* 右边：塔台设备图片（保持全高） */}
                <div
                  style={{
                    flex: 1, // 增加右边容器的占比
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    height: "100%",
                    minHeight: "100%",
                  }}
                >
                  <Image
                    src={`/assets/${currentTowerImage}.svg`}
                    preview={false}
                    style={{
                      width: "80%",
                      height: "auto",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                {/* 2px连接线 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "25%",
                    right: "25%",
                    height: "2px",
                    background: "linear-gradient(90deg, #0083FF 0%, #30BF78 50%, #0083FF 100%)",
                    borderRadius: "1px",
                    boxShadow: "0 1px 3px rgba(0, 131, 255, 0.3)",
                  }}
                />
              </div>
            </Card>
          </Col>

          {/* 右侧告警统计 */}
          <Col xs={24} lg={6}>
            <Card
              title={
                <Space>
                  <WarningOutlined style={{ color: "#0083FF" }} />
                  <span>声光告警</span>
                </Space>
              }
              extra={
                <Space>
                  <Image
                    src={"/icon/qingkong.svg"}
                    onClick={() => {
                      clearBeep()
                    }}
                    preview={false}
                    width={24}
                  />

                  {/*<span style={{ fontSize: "12px", color: "#8c8c8c" }}>声音</span>*/}
                  {/*<Switch*/}
                  {/*  checkedChildren="开启"*/}
                  {/*  unCheckedChildren="关闭"*/}
                  {/*  onChange={() => {*/}
                  {/*    toggleBeep()*/}
                  {/*  }}*/}
                  {/*  checked={isBeeping}*/}
                  {/*/>*/}
                  <Image
                    src={`${isBeeping ? "/icon/shengyin.svg" : "/icon/shengyinguanbi.svg"}`}
                    onClick={() => {
                      toggleBeep()
                    }}
                    width={24}
                    preview={false}
                  />
                </Space>
              }
              loading={loading}
              style={{
                marginBottom: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                aspectRatio: "4/3",
                minHeight: 200,
              }}
              bodyStyle={{
                padding: "16px",
                height: "calc(100% - 57px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              headStyle={{
                fontSize: "12px",
                fontWeight: "600",
                height: "24px",
                borderBottom: "none",
              }}
            >
              <Image
                src={`/assets/${currentLightImage}.svg`}
                style={{
                  width: "60%",
                  height: "auto",
                  display: "block",
                  margin: "0 auto",
                }}
                preview={false}
              />
            </Card>
            <Card
              title={
                <Space>
                  <RiseOutlined style={{ color: "#0083FF" }} />
                  <span>最新告警</span>
                </Space>
              }
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                aspectRatio: "4/3",
                minHeight: 200,
              }}
              headStyle={{
                fontSize: "12px",
                fontWeight: "600",
                height: "24px",
                borderBottom: "none",
              }}
              bodyStyle={{ padding: "16px", height: "calc(100% - 57px)" }}
            >
              <div style={{ height: "100%", overflow: "auto" }}>
                <List
                  dataSource={dashboardData?.alarm_device}
                  renderItem={(item) => (
                    <List.Item style={{ borderBottom: "1px solid #f0f0f0", padding: "6px 0" }}>
                      <div style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ color: "#222222", fontSize: "12px" }}>
                            {item.device_type_group}（{item.device_name}）
                            {item.alarm_item.config_type_name} 告警
                          </span>
                        </div>
                        <div
                          style={{
                            color: "#666",
                            fontSize: "12px",
                            lineHeight: "1.4",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ color: "#808080", fontSize: "10px" }}>
                            {item.alarm_item.suggested_action}
                          </span>
                          <span style={{ color: "#808080", fontSize: "10px" }}>
                            {item.alarm_at}
                          </span>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* 设备类型统计详情 */}
        {dashboardData?.type_statistic && dashboardData?.type_statistic.length > 0 && (
          <Row gutter={24} style={{ marginBottom: 16 }}>
            {dashboardData?.type_statistic.map((item: any, ) => (
              <Col key={item.type} xs={12} sm={8} md={6} lg={4}>
                <Card
                  title={
                    <Space>
                      <ProductOutlined style={{ color: "#0083FF" }} />
                      <span>{item.name}</span>
                    </Space>
                  }
                  loading={loading}
                  headStyle={{
                    fontSize: "12px",
                    fontWeight: "600",
                    height: "24px",
                    borderBottom: "none",
                  }}
                >
                  <div style={{ padding: "0" }}>
                    {/* 第一行：总数和在线 */}
                    <div
                      style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}
                    >
                      <div style={{ width: "48%", display: "flex", alignItems: "center" }}>
                        <Image
                          src={`/assets/total.svg`}
                          preview={false}
                          style={{ width: "30px", height: "30px", marginRight: 8 }}
                        />
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: "500", color: "#333" }}>
                            总数
                          </div>
                          <div style={{ fontSize: "10px", color: "#999" }}>
                            {item.total_num || 0}
                          </div>
                        </div>
                      </div>
                      <div style={{ width: "48%", display: "flex", alignItems: "center" }}>
                        <Image
                          src={`/assets/online.svg`}
                          preview={false}
                          style={{ width: "30px", height: "30px", marginRight: 8 }}
                        />
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: "500", color: "#52c41a" }}>
                            在线
                          </div>
                          <div style={{ fontSize: "10px", color: "#999" }}>
                            {item.online_num || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 第二行：离线和告警 */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ width: "48%", display: "flex", alignItems: "center" }}>
                        <Image
                          src={`/assets/offline.svg`}
                          preview={false}
                          style={{ width: "30px", height: "30px", marginRight: 8 }}
                        />
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: "500", color: "#ff4d4f" }}>
                            离线
                          </div>
                          <div style={{ fontSize: "10px", color: "#999" }}>
                            {item.offline_num || 0}
                          </div>
                        </div>
                      </div>
                      <div style={{ width: "48%", display: "flex", alignItems: "center" }}>
                        <Image
                          src={`/assets/alarm.svg`}
                          preview={false}
                          style={{ width: "30px", height: "30px", marginRight: 8 }}
                        />
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: "500", color: "#faad14" }}>
                            告警
                          </div>
                          <div style={{ fontSize: "10px", color: "#999" }}>
                            {item.alarm_num || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </PageContainer>
  )
}

export default Dashboard

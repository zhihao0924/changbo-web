import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { PageContainer } from "@ant-design/pro-components"
import {
  Card,
  Row,
  Col,
  Typography,
  Tooltip,
  Button,
  Space,
  Statistic,
  Image,
  Switch,
  List,
} from "antd"
import { Line, Pie } from "@ant-design/charts"
import styles from "./index.less"
import Services from "@/pages/dashboard/services"
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  WarningOutlined,
  SoundOutlined,
  SoundFilled,
  AlertOutlined,
  ToolOutlined,
  AreaChartOutlined,
  CodeSandboxOutlined,
  RiseOutlined,
  ProductOutlined,
} from "@ant-design/icons"

const { Title } = Typography

// 常量配置
const DASHBOARD_CONFIG = {
  refreshInterval: 3000, // 3秒刷新一次数据
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
  return useMemo(
    () => ({
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
    }),
    [data, total_healthy, total, isFirstRender],
  )
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

// 设备状态卡片组件
const DeviceStatusCard: React.FC<{ data: any }> = ({ data }) => (
  <Card title={data.name} style={{ height: "100%" }}>
    <Row justify="center" align="middle" style={{ textAlign: "center", marginBottom: 8 }}>
      <Col span={5}>
        <Tooltip title="设备总数">
          <DatabaseOutlined style={{ color: "#30BF78" }} />
        </Tooltip>
      </Col>
      <Col span={5}>
        <Tooltip title="在线设备">
          <CheckCircleOutlined style={{ color: "#30BF78" }} />
        </Tooltip>
      </Col>
      <Col span={5}>
        <Tooltip title="离线设备">
          <CloseCircleOutlined style={{ color: "#F4664A" }} />
        </Tooltip>
      </Col>
      <Col span={5}>
        <Tooltip title="告警设备">
          <WarningOutlined style={{ color: "#FAAD14" }} />
        </Tooltip>
      </Col>
      <Col span={4}>
        <Tooltip title="维护中设备">
          <ToolOutlined style={{ color: "#1890ff" }} />
        </Tooltip>
      </Col>
    </Row>
    <Row justify="center" align="middle" style={{ textAlign: "center" }}>
      <Col span={5}>
        <Statistic value={data.total_num} valueStyle={{ fontSize: 16 }} />
      </Col>
      <Col span={5}>
        <Statistic value={data.online_num} valueStyle={{ fontSize: 16 }} />
      </Col>
      <Col span={5}>
        <Statistic value={data.offline_num} valueStyle={{ fontSize: 16 }} />
      </Col>
      <Col span={5}>
        <Statistic value={data.alarm_num} valueStyle={{ fontSize: 16 }} />
      </Col>
      <Col span={4}>
        <Statistic value={data.maintaining_num} valueStyle={{ fontSize: 16 }} />
      </Col>
    </Row>
  </Card>
)

// 告警统计卡片
const AlertStatsCard: React.FC<{
  alertCount: number
  isBeeping: boolean
  onToggleBeep: () => void
  loading?: boolean
  alarmDevice: []
}> = ({ alertCount, isBeeping, onToggleBeep, loading, alarmDevice }) => {
  // 按告警时间排序，最新的在前
  const sortedAlarmDevices = alarmDevice

  return (
    <Card
      title={
        <Space>
          <AlertOutlined />
          <span>告警统计</span>
          {alertCount > 0 && (
            <span
              style={{
                background: "#ff4d4f",
                color: "white",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              {alertCount}
            </span>
          )}
        </Space>
      }
      loading={loading}
      extra={
        <Tooltip title={isBeeping ? "停止滴滴声" : "开始滴滴声"}>
          <span
            onClick={onToggleBeep}
            style={{
              cursor: "pointer",
              fontSize: "16px",
              color: isBeeping ? "#1890ff" : "#d9d9d9",
              transition: "color 0.3s ease",
            }}
          >
            {isBeeping ? <SoundOutlined /> : <SoundFilled />}
          </span>
        </Tooltip>
      }
      style={{ height: "100%" }}
    >
      {alertCount === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }} />
          <div style={{ color: "#52c41a", fontSize: 16, fontWeight: 500 }}>系统运行正常</div>
          <div style={{ color: "#8c8c8c", fontSize: 14, marginTop: 8 }}>暂无告警设备</div>
        </div>
      ) : (
        <>
          {/* 告警概览 */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#ff4d4f",
                marginBottom: 4,
              }}
            >
              {alertCount}
            </div>
            <div style={{ fontSize: 14, color: "#8c8c8c" }}>告警设备总数</div>
          </div>

          {/* 告警列表 */}
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 12,
                color: "#262626",
              }}
            >
              最新告警 ({sortedAlarmDevices.length})
            </div>

            {sortedAlarmDevices.slice(0, 3).map((item, index) => (
              <div
                key={item.device_id}
                style={{
                  padding: "12px",
                  marginBottom: 8,
                  borderRadius: "6px",
                  background: index % 2 === 0 ? "#fafafa" : "transparent",
                  border: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 13, color: "#262626" }}>
                    {item.device_type_group} - {item.device_name}
                  </div>
                  {/*<div style={{ fontSize: 11, color: "#8c8c8c" }}>{item.config_type_name}</div>*/}
                </div>

                {item?.alarm_item.map((alarmItem) => {
                  return (
                    <>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#ff4d4f",
                          fontWeight: 500,
                          marginBottom: 4,
                        }}
                      >
                        {alarmItem.config_type_name}异常
                      </div>
                      <div style={{ fontSize: 11, color: "#595959", lineHeight: 1.4 }}>
                        建议操作：{alarmItem.suggested_action}
                      </div>
                    </>
                  )
                })}
              </div>
            ))}

            {sortedAlarmDevices.length > 3 && (
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                  还有 {sortedAlarmDevices.length - 3} 条告警未显示
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  )
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<API_PostDashboard.Result>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 计算告警设备数量
  const alarmDeviceCount = useMemo(() => {
    const count = dashboardData?.alarm_device?.length || 0
    return count
  }, [dashboardData?.alarm_device])

  const { isBeeping, toggleBeep } = useBeep(alarmDeviceCount)

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
    } catch (error) {
      console.error("获取仪表盘数据失败:", error)
      setError("网络请求失败")
    } finally {
      setLoading(false)
    }
  }, [])

  // 定时刷新数据
  useEffect(() => {
    getDashboardData()

    const timer = setInterval(getDashboardData, DASHBOARD_CONFIG.refreshInterval)

    return () => clearInterval(timer)
  }, [getDashboardData])

  // 图片轮播定时器
  useEffect(() => {
    const imageTimer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % 3)
    }, 500) // 每0.5秒切换一次图片

    return () => clearInterval(imageTimer)
  }, [])

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
    <PageContainer>
      <div className={styles.container}>
        {/* 页面标题 */}
        <Title level={3} style={{ textAlign: "center", width: "100%", marginBottom: 24 }}>
          专网通信智能网管平台
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
                    src={`/assets/cabinet_tx_rx.svg`}
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
                    src={`/assets/tower_${currentImageIndex + 1}.svg`}
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
                  <span style={{ fontSize: "12px", color: "#8c8c8c" }}>告警声音</span>
                  <Switch
                    onChange={() => {
                      toggleBeep()
                    }}
                    checked={isBeeping}
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
                src={
                  dashboardData?.alarm_device.length > 0
                    ? `/assets/light_red.svg`
                    : `/assets/light_green.svg`
                }
                style={{
                  width: "60%",
                  height: "auto",
                  display: "block",
                  margin: "0 auto",
                }}
                preview={false}
              />{" "}
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
                            {item.device_type_group}（{item.device_name}）{" "}
                            {item.alarm_item.config_type_name} 异常
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
                          <span style={{ color: "#808080", fontSize: "10px" }}>{item.alarm_at}</span>
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
            {dashboardData?.type_statistic.map((item: any, index: number) => (
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

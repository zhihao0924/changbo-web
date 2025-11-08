import { PageContainer } from "@ant-design/pro-components"
import { Card, Col, Row, Tag, Progress, Form, Select, Modal, Checkbox } from "antd"
import React, { useCallback, useEffect, useState, useMemo } from "react"
import Services from "@/pages/device/services"
import DeviceNameSelect from "@/components/DeviceNameSelect"
import { ArrowDownOutlined, ArrowUpOutlined, CheckOutlined } from "@ant-design/icons"
import type { API_PostDeviceList, API_PostDeviceTypes } from "../services/typings/device"
import { SYSTEM_CONFIG } from "@/constants"

// 常量配置
const PAGE_SIZE = 300

// 工具函数
const getRefreshInterval = (): number => {
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
}

// 获取状态图标
const getStatusIcon = (metricItem: API_PostDeviceList.MetricItems) => {
  const { alarm_min, alarm_max, show_min_val, show_max_val, current_val } = metricItem

  if (typeof show_min_val === "number" && current_val < show_min_val) {
    return <></>
  }
  if (typeof show_max_val === "number" && current_val > show_max_val) {
    return <></>
  }

  if (typeof alarm_min === "number" && current_val < alarm_min) {
    return <ArrowDownOutlined style={{ color: "red" }} />
  }
  if (typeof alarm_max === "number" && current_val > alarm_max) {
    return <ArrowUpOutlined style={{ color: "red" }} />
  }
  return <CheckOutlined style={{ color: "green" }} />
}

// 指标项状态组件
interface MetricItemProps {
  metricItem: API_PostDeviceList.MetricItems
}

// 设备卡片组件
interface DeviceCardProps {
  device: API_PostDeviceList.List
  onDoubleClick: () => void
  isEvenRow?: boolean
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onDoubleClick, isEvenRow = false }) => {
  const deviceTitle = `${device.device_type_alias || device.device_type_group}:${device.name}`

  return (
    <Card
      title={deviceTitle}
      extra={<Tag color={device.tag_color}>{device.status_text}</Tag>}
      onDoubleClick={onDoubleClick}
      style={{
        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.1)",
        transition: "0.3s",
        borderRadius: "8px",
        backgroundColor: isEvenRow ? "#fafafa" : "#ffffff",
        border: isEvenRow ? "1px solid #f0f0f0" : "1px solid #e8e8e8",
        position: "relative", // 添加相对定位
      }}
      hoverable
    >
      {/* 右上角标签区域 */}
      <div
        style={{
          position: "absolute",
          top: "48px", // 在extra区域下面
          right: "24px", // 右侧对齐
          zIndex: 1,
        }}
      >
        {device.is_online && !device.is_maintaining && device.is_alarm && (
          <Tag color={"red"}>告警中</Tag>
        )}
        {device.is_online && !device.is_maintaining && !device.is_module_online && (
          <Tag color={"red"}>模块离线</Tag>
        )}
      </div>

      <Row>
        {device?.metric_items
          ?.filter((metricItem) => metricItem.show_in_list)
          .map((metricItem, index) => (
            <React.Fragment key={index}>
              <Col span={8}>{metricItem.config_type_name}</Col>
              <Col span={12}>
                <MetricItem metricItem={metricItem} />
              </Col>
              <Col
                span={4}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {metricItem.is_set_current_val &&
                  (typeof metricItem.alarm_min === "number" ||
                    typeof metricItem.alarm_max === "number") &&
                  getStatusIcon(metricItem)}
              </Col>
            </React.Fragment>
          ))}
      </Row>
    </Card>
  )
}

const MetricItem: React.FC<MetricItemProps> = ({ metricItem }) => {
  // 判断是否显示值
  const shouldShowValue = useMemo(() => {
    const { show_max_val, show_min_val, current_val } = metricItem
    const withinMaxBounds = typeof show_max_val !== "number" || current_val <= show_max_val
    const withinMinBounds = typeof show_min_val !== "number" || current_val > show_min_val
    return withinMaxBounds && withinMinBounds
  }, [metricItem])

  // 判断是否告警
  const isAlarm = useMemo(() => {
    const { alarm_min, alarm_max, current_val, is_set_current_val } = metricItem
    if (!is_set_current_val) return false

    return (
      (typeof alarm_min === "number" && current_val < alarm_min) ||
      (typeof alarm_max === "number" && current_val > alarm_max)
    )
  }, [metricItem])

  // 格式化显示值
  const formatValue = useCallback(() => {
    const { show_max_val, show_min_val, current_val, unit } = metricItem

    if (typeof show_max_val === "number" && current_val > show_max_val) {
      return "∞"
    }
    if (typeof show_min_val === "number" && current_val < show_min_val) {
      return "-∞"
    }
    return `${Number(current_val ?? 0).toFixed(2)} ${unit}`
  }, [metricItem])

  // 计算进度百分比
  const getProgressPercent = useCallback(() => {
    const { alarm_min, alarm_max, current_val } = metricItem
    if (typeof alarm_min !== "number" || typeof alarm_max !== "number") return 0
    return ((current_val - alarm_min) * 100) / (alarm_max - alarm_min)
  }, [metricItem])

  if (metricItem.is_module) {
    return <span>{metricItem.current_val ? "在线" : "离线"}</span>
  }

  if (!shouldShowValue) {
    return (
      <div style={{ display: "flex", alignItems: "center", height: "22px" }}>
        <span>——</span>
      </div>
    )
  }

  return (
    <Progress
      percent={getProgressPercent()}
      steps={5}
      size="small"
      showInfo={true}
      format={() => <span style={{ color: isAlarm ? "red" : "" }}>{formatValue()}</span>}
      strokeColor={isAlarm ? "red" : "green"}
    />
  )
}

// 设备详情模态框组件
interface DeviceDetailModalProps {
  visible: boolean
  deviceId: number | null
  deviceList: API_PostDeviceList.List[]
  onCancel: () => void
}

const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  visible,
  deviceId,
  deviceList,
  onCancel,
}) => {
  const selectedDevice = deviceList.find((d) => d.id === deviceId)

  if (!selectedDevice) return null

  return (
    <Modal title={`设备详情`} open={visible} onCancel={onCancel} footer={null} width={600}>
      <Card bordered={false}>
        <Row>
          <Col span={8} style={{ backgroundColor: "#f8f9fa" }}>
            设备类型
          </Col>
          <Col span={16} style={{ backgroundColor: "#f8f9fa" }}>
            {selectedDevice.device_type_alias}
          </Col>
          <Col span={8} style={{ backgroundColor: "#ffffff" }}>
            设备编号
          </Col>
          <Col span={16} style={{ backgroundColor: "#ffffff" }}>
            {selectedDevice.name}
          </Col>

          {selectedDevice.metric_items
            ?.filter((metricItem) => metricItem.show_in_detail)
            ?.map((metricItem, index) => (
              <React.Fragment key={index}>
                <Col
                  span={8}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff",
                  }}
                >
                  {metricItem.config_type_name}
                </Col>
                <Col
                  span={12}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff",
                  }}
                >
                  <MetricItem metricItem={metricItem} />
                </Col>
                <Col
                  span={4}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff",
                  }}
                >
                  {metricItem.is_set_current_val &&
                    (typeof metricItem.alarm_min === "number" ||
                      typeof metricItem.alarm_max === "number") &&
                    getStatusIcon(metricItem)}
                </Col>
              </React.Fragment>
            ))}
        </Row>
      </Card>
    </Modal>
  )
}

const DeviceStatus: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<API_PostDeviceTypes.List[]>([])
  const [deviceList, setDeviceList] = useState<API_PostDeviceList.List[]>([])
  const [form] = Form.useForm()
  const [deviceId, setDeviceId] = useState<number | null>(null)
  const [showModalVisible, setShowModalVisible] = useState(false)

  // 获取设备类型
  const getDeviceTypes = useCallback(async () => {
    try {
      const res = await Services.api.postDeviceTypes({})
      if (res?.res?.list) {
        setDeviceTypes(res.res.list)
        return res.res.list
      }
      return []
    } catch (error) {
      console.error("获取设备类型失败:", error)
      return []
    }
  }, [])

  // 获取设备列表
  const getLists = useCallback(
    async (queryParams: {
      page?: number
      limit?: number
      type?: string
      ip?: string
      is_alarm_or_module_offline?: boolean
    }) => {
      console.log(queryParams)
      try {
        const res = await Services.api.postDeviceList(
          {
            limit: PAGE_SIZE,
            ...queryParams,
          },
          {
            showLoading: false,
            showToast: false,
          },
        )

        if (res?.res?.list) {
          setDeviceList(res.res.list)
          return {
            total: res.res.total,
            data: res.res.list,
            success: true,
          }
        }
        return { success: false }
      } catch (error) {
        console.error("获取设备列表失败:", error)
        return { success: false }
      }
    },
    [],
  )

  // 设备类型选项
  const deviceTypeOptions = useMemo(() => {
    return deviceTypes.map((type) => ({
      label: type.device_type_alias || type.device_type,
      value: type.id,
    }))
  }, [deviceTypes])

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      await getDeviceTypes()
      await getLists(form.getFieldsValue())
    }
    initData()
  }, [form, getDeviceTypes, getLists])

  // 定时刷新数据
  useEffect(() => {
    const intervalId = setInterval(() => {
      getLists(form.getFieldsValue())
    }, getRefreshInterval())

    return () => clearInterval(intervalId)
  }, [form, getLists])
  return (
    <PageContainer>
      <Form form={form}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="device_type_id" label="设备类型">
              <Select
                placeholder="请选择类型"
                allowClear
                options={deviceTypeOptions}
                filterOption={(input, option) => (option?.label ?? "").includes(input.trim())}
                showSearch
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="id_list" label="设备编号">
              <DeviceNameSelect />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="is_alarm_or_module_offline" label="告警中" valuePropName="checked">
              <Checkbox />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Row gutter={[24, 24]}>
        {deviceList?.map((device, index) => (
          <Col key={device.id} xs={24} sm={12} md={8} lg={6}>
            <DeviceCard
              device={device}
              onDoubleClick={() => {
                setDeviceId(device.id)
                setShowModalVisible(true)
              }}
              isEvenRow={index % 2 === 0}
            />
          </Col>
        ))}
      </Row>

      <DeviceDetailModal
        visible={showModalVisible}
        deviceId={deviceId}
        deviceList={deviceList}
        onCancel={() => setShowModalVisible(false)}
      />
    </PageContainer>
  )
}

export default DeviceStatus

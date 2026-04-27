import { PageContainer } from "@ant-design/pro-components"
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
} from "antd"
import { EditOutlined, EyeOutlined, PlusOutlined, RadarChartOutlined } from "@ant-design/icons"
import React, { useCallback, useEffect, useState } from "react"
import { history } from "umi"
import Services from "@/pages/device/services"
import type {
  API_PostLibiioDeviceList,
  API_PostLibiioDeviceSave,
} from "@/pages/device/services/typings/device"
import "./index.less"

type LibiioDevice = API_PostLibiioDeviceList.List

const MAX_FETCH_SIZE = 1000
const MAX_DEVICE_COUNT = 4
const LIBIIO_DEVICE_TYPE_OPTIONS = [
  { label: "TX发射功率", value: 1 },
  { label: "RX接收RSSI", value: 2 },
]
const FFT_SIZE_OPTIONS = [12, 14, 16, 18, 20].map((power) => ({
  label: `${2 ** power} (2^${power})`,
  value: 2 ** power,
}))

const formatValue = (value?: number, unit?: string) =>
  typeof value === "number" ? `${value} ${unit || ""}`.trim() : "-"

const formatDeviceType = (value?: number) => {
  if (typeof value !== "number") {
    return "-"
  }

  return (
    LIBIIO_DEVICE_TYPE_OPTIONS.find((item) => item.value === value)?.label || `未知类型 (${value})`
  )
}

const getMetricItems = (device: LibiioDevice) => [
  {
    key: "center_freq",
    label: "中心频率",
    value: formatValue(device.center_freq, "MHz"),
  },
  {
    key: "sampling_rate",
    label: "采样率",
    value: formatValue(device.sampling_rate, "MHz"),
  },
  {
    key: "fft_size",
    label: "FFT 点数",
    value: `${device.fft_size ?? "-"}`,
  },
  {
    key: "output_frequency_count",
    label: "输出指定频点数",
    value: `${device.target_freq_count ?? device.output_frequency_count ?? 0}`,
    clickable: true,
  },
]

const DeviceLibiio: React.FC = () => {
  const [form] = Form.useForm<API_PostLibiioDeviceSave.Params>()
  const [detailDevice, setDetailDevice] = useState<LibiioDevice>()
  const [editingDevice, setEditingDevice] = useState<LibiioDevice>()
  const [modalVisible, setModalVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState<LibiioDevice[]>([])
  const canCreateDevice = devices.length < MAX_DEVICE_COUNT

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true)
      const res = await Services.api.postLibiioDeviceList(
        {
          page: 1,
          limit: MAX_FETCH_SIZE,
        },
        { showLoading: false, showToast: false },
      )
      setDevices(res?.res?.list || [])
    } catch (error) {
      console.error("获取 Libiio 设备失败:", error)
      message.error("获取设备列表失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDevices()
  }, [loadDevices])

  const openModal = useCallback(
    (record?: LibiioDevice) => {
      setEditingDevice(record)
      setModalVisible(true)
      form.resetFields()
      form.setFieldsValue({
        id: record?.id,
        ip: record?.ip,
        type: record?.type,
        center_freq: record?.center_freq,
        sampling_rate: record?.sampling_rate,
        fft_size: record?.fft_size,
      })
    },
    [form],
  )

  const closeModal = useCallback(() => {
    setModalVisible(false)
    setEditingDevice(undefined)
    form.resetFields()
  }, [form])

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      setSubmitLoading(true)
      const res = await Services.api.postLibiioDeviceSave(values, {
        showLoading: true,
        showToast: false,
      })
      message.success(res?.msg || (editingDevice ? "Libiio 设备已更新" : "Libiio 设备已创建"))
      closeModal()
      await loadDevices()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      console.error("保存 Libiio 设备失败:", error)
      message.error("保存失败，请稍后重试")
    } finally {
      setSubmitLoading(false)
    }
  }, [closeModal, editingDevice, form, loadDevices])

  const goToFrequencyConfig = useCallback((device: LibiioDevice) => {
    history.push(`/device/libiio/config/${device.id}`)
  }, [])

  return (
    <PageContainer className="libiio-page">
      <Card className="libiio-table-card" bodyStyle={{ padding: 8 }}>
        <Spin spinning={loading}>
          <Row gutter={[4, 8]}>
            {devices.map((device) => (
              <Col key={device.id} xs={24} sm={12} lg={12} xl={6}>
                <Card className="libiio-device-card">
                  <div className="libiio-device-card__actions">
                    <Space size={4}>
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => setDetailDevice(device)}
                      >
                        详情
                      </Button>
                      <Button type="link" icon={<EditOutlined />} onClick={() => openModal(device)}>
                        编辑
                      </Button>
                    </Space>
                  </div>
                  <div className="libiio-device-card__content">
                    <div className="libiio-device-card__hero">
                      <div className="libiio-device-card__hero-main">
                        <span className="libiio-device-card__hero-label">IP 地址</span>
                        <div className="libiio-device-card__hero-value">
                          {device.ip || "未配置"}
                        </div>
                      </div>
                      <div className="libiio-device-card__hero-side">
                        <span className="libiio-device-card__hero-label">类型</span>
                        <div className="libiio-device-card__hero-type">
                          {formatDeviceType(device.type)}
                        </div>
                      </div>
                    </div>

                    <div className="libiio-device-card__metrics">
                      {getMetricItems(device).map((item) => (
                        <div
                          className={`libiio-metric-item ${item.clickable ? "clickable" : ""}`}
                          key={item.key}
                          onClick={
                            item.key === "output_frequency_count"
                              ? () => goToFrequencyConfig(device)
                              : undefined
                          }
                          role={item.clickable ? "button" : undefined}
                          tabIndex={item.clickable ? 0 : undefined}
                        >
                          <span className="libiio-metric-item__label">{item.label}</span>
                          <span className="libiio-metric-item__value">
                            {item.key === "output_frequency_count" && (
                              <RadarChartOutlined className="libiio-metric-item__icon" />
                            )}
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
            {canCreateDevice && (
              <Col xs={24} sm={12} lg={12} xl={6}>
                <Card
                  className="libiio-device-card libiio-device-card--create"
                  hoverable
                  onClick={() => openModal()}
                >
                  <div className="libiio-create-card">
                    <div className="libiio-create-card__icon">
                      <PlusOutlined />
                    </div>
                    <div className="libiio-create-card__title">新增设备</div>
                    <div className="libiio-create-card__desc">
                      还可以新增 {MAX_DEVICE_COUNT - devices.length} 台设备
                    </div>
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        </Spin>
      </Card>

      <Drawer
        width={520}
        title={detailDevice ? `Libiio 设备详情 · #${detailDevice.id}` : "Libiio 设备详情"}
        open={!!detailDevice}
        onClose={() => setDetailDevice(undefined)}
      >
        {detailDevice && (
          <>
            <div className="libiio-detail-block">
              <div className="libiio-detail-title">连接信息</div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="设备 ID">{detailDevice.id}</Descriptions.Item>
                <Descriptions.Item label="IP 地址">{detailDevice.ip || "-"}</Descriptions.Item>
                <Descriptions.Item label="类型">
                  {formatDeviceType(detailDevice.type)}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="libiio-detail-block">
              <div className="libiio-detail-title">射频参数</div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="中心频率">
                  {detailDevice.center_freq} MHz
                </Descriptions.Item>
                <Descriptions.Item label="采样率">
                  {typeof detailDevice.sampling_rate === "number"
                    ? `${detailDevice.sampling_rate} MHz`
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="FFT 点数">
                  {detailDevice.fft_size ?? "-"}
                </Descriptions.Item>
                <Descriptions.Item label="输出指定频点数">
                  {detailDevice.target_freq_count ?? detailDevice.output_frequency_count ?? 0}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title={editingDevice ? `编辑 Libiio 设备 #${editingDevice.id}` : "新增 Libiio 设备"}
        open={modalVisible}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="ip"
            label="IP 地址"
            rules={[
              {
                pattern: /^$|^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: "请输入有效的 IPv4 地址",
              },
            ]}
          >
            <Input placeholder="例如 192.168.1.20" />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select allowClear options={LIBIIO_DEVICE_TYPE_OPTIONS} placeholder="请选择设备类型" />
          </Form.Item>
          <Form.Item
            name="center_freq"
            label="中心频率 (MHz)"
            rules={[{ required: true, message: "请输入中心频率" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} placeholder="请输入中心频率" />
          </Form.Item>
          <Form.Item
            name="sampling_rate"
            label="采样率 (MHz)"
            rules={[{ required: true, message: "请输入采样率" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} placeholder="请输入采样率" />
          </Form.Item>
          <Form.Item
            name="fft_size"
            label="FFT 点数"
            rules={[{ required: true, message: "请输入 FFT 点数" }]}
          >
            <Select options={FFT_SIZE_OPTIONS} placeholder="请选择 FFT 点数" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}

export default DeviceLibiio

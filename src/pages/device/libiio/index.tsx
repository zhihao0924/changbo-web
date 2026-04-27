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
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { history, useIntl } from "umi"
import Services from "@/pages/device/services"
import type {
  API_PostLibiioDeviceList,
  API_PostLibiioDeviceSave,
} from "@/pages/device/services/typings/device"
import "./index.less"

type LibiioDevice = API_PostLibiioDeviceList.List

const MAX_FETCH_SIZE = 1000
const MAX_DEVICE_COUNT = 4
const FFT_SIZE_OPTIONS = [12, 14, 16, 18, 20].map((power) => ({
  label: `${2 ** power} (2^${power})`,
  value: 2 ** power,
}))

const formatValue = (value?: number, unit?: string) =>
  typeof value === "number" ? `${value} ${unit || ""}`.trim() : "-"

const DeviceLibiio: React.FC = () => {
  const intl = useIntl()
  const [form] = Form.useForm<API_PostLibiioDeviceSave.Params>()
  const [detailDevice, setDetailDevice] = useState<LibiioDevice>()
  const [editingDevice, setEditingDevice] = useState<LibiioDevice>()
  const [modalVisible, setModalVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState<LibiioDevice[]>([])
  const canCreateDevice = devices.length < MAX_DEVICE_COUNT
  const t = useCallback(
    (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
      intl.formatMessage({ id, defaultMessage }, values),
    [intl],
  )

  const libiioDeviceTypeOptions = useMemo(
    () => [
      { label: t("app.device.libiio.type.txPower", "TX Transmit Power"), value: 1 },
      { label: t("app.device.libiio.type.rxRssi", "RX Receive RSSI"), value: 2 },
    ],
    [t],
  )

  const formatDeviceType = useCallback(
    (value?: number) => {
      if (typeof value !== "number") {
        return "-"
      }

      return (
        libiioDeviceTypeOptions.find((item) => item.value === value)?.label ||
        t("app.device.libiio.type.unknown", "Unknown Type ({value})", { value })
      )
    },
    [libiioDeviceTypeOptions, t],
  )

  const getMetricItems = useCallback(
    (device: LibiioDevice) => [
      {
        key: "center_freq",
        label: t("app.device.libiio.centerFrequency", "Center Frequency"),
        value: formatValue(device.center_freq, "MHz"),
      },
      {
        key: "sampling_rate",
        label: t("app.device.libiio.samplingRate", "Sampling Rate"),
        value: formatValue(device.sampling_rate, "MHz"),
      },
      {
        key: "fft_size",
        label: t("app.device.libiio.fftSize", "FFT Size"),
        value: `${device.fft_size ?? "-"}`,
      },
      {
        key: "output_frequency_count",
        label: t("app.device.libiio.outputFrequencyCount", "Output Target Frequencies"),
        value: `${device.target_freq_count ?? device.output_frequency_count ?? 0}`,
        clickable: true,
      },
    ],
    [t],
  )

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
      message.error(t("app.device.libiio.fetchListFailed", "Failed to load device list"))
    } finally {
      setLoading(false)
    }
  }, [t])

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
      message.success(
        res?.msg ||
          (editingDevice
            ? t("app.device.libiio.updateSuccess", "Libiio device updated")
            : t("app.device.libiio.createSuccess", "Libiio device created")),
      )
      closeModal()
      await loadDevices()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      console.error("保存 Libiio 设备失败:", error)
      message.error(t("app.device.libiio.saveFailed", "Save failed. Please try again later."))
    } finally {
      setSubmitLoading(false)
    }
  }, [closeModal, editingDevice, form, loadDevices, t])

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
                        {t("app.common.detail", "Details")}
                      </Button>
                      <Button type="link" icon={<EditOutlined />} onClick={() => openModal(device)}>
                        {t("app.common.edit", "Edit")}
                      </Button>
                    </Space>
                  </div>
                  <div className="libiio-device-card__content">
                    <div className="libiio-device-card__hero">
                      <div className="libiio-device-card__hero-main">
                        <span className="libiio-device-card__hero-label">
                          {t("app.device.libiio.ipAddress", "IP Address")}
                        </span>
                        <div className="libiio-device-card__hero-value">
                          {device.ip || t("app.device.libiio.notConfigured", "Not configured")}
                        </div>
                      </div>
                      <div className="libiio-device-card__hero-side">
                        <span className="libiio-device-card__hero-label">
                          {t("app.device.libiio.type", "Type")}
                        </span>
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
                    <div className="libiio-create-card__title">
                      {t("app.device.libiio.addDevice", "Add Device")}
                    </div>
                    <div className="libiio-create-card__desc">
                      {t("app.device.libiio.remainingDevices", "You can add {count} more devices", {
                        count: MAX_DEVICE_COUNT - devices.length,
                      })}
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
        title={
          detailDevice
            ? t("app.device.libiio.detailTitleWithId", "Libiio Device Details · #{id}", {
                id: detailDevice.id,
              })
            : t("app.device.libiio.detailTitle", "Libiio Device Details")
        }
        open={!!detailDevice}
        onClose={() => setDetailDevice(undefined)}
      >
        {detailDevice && (
          <>
            <div className="libiio-detail-block">
              <div className="libiio-detail-title">
                {t("app.device.libiio.connectionInfo", "Connection Information")}
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={t("app.device.libiio.deviceId", "Device ID")}>
                  {detailDevice.id}
                </Descriptions.Item>
                <Descriptions.Item label={t("app.device.libiio.ipAddress", "IP Address")}>
                  {detailDevice.ip || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={t("app.device.libiio.type", "Type")}>
                  {formatDeviceType(detailDevice.type)}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="libiio-detail-block">
              <div className="libiio-detail-title">
                {t("app.device.libiio.rfParameters", "RF Parameters")}
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item
                  label={t("app.device.libiio.centerFrequency", "Center Frequency")}
                >
                  {detailDevice.center_freq} MHz
                </Descriptions.Item>
                <Descriptions.Item label={t("app.device.libiio.samplingRate", "Sampling Rate")}>
                  {typeof detailDevice.sampling_rate === "number"
                    ? `${detailDevice.sampling_rate} MHz`
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label={t("app.device.libiio.fftSize", "FFT Size")}>
                  {detailDevice.fft_size ?? "-"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={t("app.device.libiio.outputFrequencyCount", "Output Target Frequencies")}
                >
                  {detailDevice.target_freq_count ?? detailDevice.output_frequency_count ?? 0}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title={
          editingDevice
            ? t("app.device.libiio.editDeviceWithId", "Edit Libiio Device #{id}", {
                id: editingDevice.id,
              })
            : t("app.device.libiio.addLibiioDevice", "Add Libiio Device")
        }
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
            label={t("app.device.libiio.ipAddress", "IP Address")}
            rules={[
              {
                pattern: /^$|^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: t("app.device.libiio.ipInvalid", "Please enter a valid IPv4 address"),
              },
            ]}
          >
            <Input placeholder={t("app.device.libiio.ipExample", "For example, 192.168.1.20")} />
          </Form.Item>
          <Form.Item name="type" label={t("app.device.libiio.type", "Type")}>
            <Select
              allowClear
              options={libiioDeviceTypeOptions}
              placeholder={t("app.device.libiio.selectDeviceType", "Please select device type")}
            />
          </Form.Item>
          <Form.Item
            name="center_freq"
            label={t("app.device.libiio.centerFrequencyWithUnit", "Center Frequency (MHz)")}
            rules={[
              {
                required: true,
                message: t(
                  "app.device.libiio.centerFrequencyRequired",
                  "Please enter center frequency",
                ),
              },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder={t(
                "app.device.libiio.centerFrequencyPlaceholder",
                "Please enter center frequency",
              )}
            />
          </Form.Item>
          <Form.Item
            name="sampling_rate"
            label={t("app.device.libiio.samplingRateWithUnit", "Sampling Rate (MHz)")}
            rules={[
              {
                required: true,
                message: t("app.device.libiio.samplingRateRequired", "Please enter sampling rate"),
              },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder={t(
                "app.device.libiio.samplingRatePlaceholder",
                "Please enter sampling rate",
              )}
            />
          </Form.Item>
          <Form.Item
            name="fft_size"
            label={t("app.device.libiio.fftSize", "FFT Size")}
            rules={[
              {
                required: true,
                message: t("app.device.libiio.fftSizeRequired", "Please select FFT size"),
              },
            ]}
          >
            <Select
              options={FFT_SIZE_OPTIONS}
              placeholder={t("app.device.libiio.fftSizePlaceholder", "Please select FFT size")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}

export default DeviceLibiio

import { PageContainer } from "@ant-design/pro-components"
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Spin,
  Tooltip,
} from "antd"
import { EditOutlined, RadarChartOutlined } from "@ant-design/icons"
import React, { useCallback, useEffect, useState } from "react"
import { history, useIntl } from "umi"
import Services from "@/pages/device/services"
import type {
  API_PostDeviceList,
  API_PostLibiioDeviceList,
} from "@/pages/device/services/typings/device"
import "./index.less"

type LibiioDevice = API_PostDeviceList.List & {
  panel_info?: {
    name?: string
  }
}

type LibiioModule = API_PostLibiioDeviceList.List & Record<string, any>

type LibiioModuleField = {
  key: string
  label: string
  value: string | number | boolean
}

type EditFormValues = {
  ip: string
  fs_dbm?: number
  rx_ip?: string
  rx_center_freq?: number
  rx_sampling_rate?: number
  rx_fft_size?: number
  rx_gain?: number
  tx_ip?: string
  tx_center_freq?: number
  tx_sampling_rate?: number
  tx_fft_size?: number
  tx_gain?: number
}

const MAX_FETCH_SIZE = 1000
const LIBIIO_DEVICE_TYPE = "E0"
const IPV4_REGEXP = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
const FFT_SIZE_OPTIONS = [12, 14, 16, 18, 20].map((power) => ({
  label: `${2 ** power}(2^${power})`,
  value: 2 ** power,
}))

const formatFftSize = (value: number) => {
  const power = Math.log2(value)
  return Number.isInteger(power) ? `${value}(2^${power})` : value
}

const COMMON_MODULE_FIELDS = new Set([
  "id",
  "ip",
  "type",
  "center_freq",
  "sampling_rate",
  "fft_size",
  "target_freq_count",
  "output_frequency_count",
  "output_frequency_configs",
  "created_at",
  "updated_at",
])

const formatModuleFieldValue = (value: any, key?: string) => {
  if (value === undefined || value === null || value === "") {
    return "-"
  }
  if (key?.toLowerCase().endsWith("fft_size") && typeof value === "number") {
    return formatFftSize(value)
  }
  if (Array.isArray(value)) {
    return value.length
  }
  if (typeof value === "object") {
    return JSON.stringify(value)
  }
  return value
}

const formatFieldName = (key: string) =>
  key
    .replace(/^(rx|tx)_/i, "")
    .split("_")
    .filter(Boolean)
    .map((item) => item.toUpperCase())
    .join(" ")

const DeviceLibiio: React.FC = () => {
  const intl = useIntl()
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [devices, setDevices] = useState<LibiioDevice[]>([])
  const [modules, setModules] = useState<LibiioModule[]>([])
  const [editingDevice, setEditingDevice] = useState<LibiioDevice | null>(null)
  const [editingModule, setEditingModule] = useState<LibiioModule | undefined>()
  const [editForm] = Form.useForm<EditFormValues>()
  const t = useCallback(
    (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
      intl.formatMessage({ id, defaultMessage }, values),
    [intl],
  )

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true)
      const [typeRes, moduleRes] = await Promise.all([
        Services.api.postDeviceTypes({}, { showLoading: false, showToast: false }),
        Services.api.postLibiioDeviceList(
          {
            page: 1,
            limit: MAX_FETCH_SIZE,
          },
          { showLoading: false, showToast: false },
        ),
      ])
      const e0Type = typeRes?.res?.list?.find((item) => item.device_type === LIBIIO_DEVICE_TYPE)
      setModules(moduleRes?.res?.list || [])

      if (!e0Type?.id) {
        setDevices([])
        return
      }

      const res = await Services.api.postDeviceList(
        {
          page: 1,
          limit: MAX_FETCH_SIZE,
          device_type_id: e0Type.id,
        },
        { showLoading: false, showToast: false },
      )
      setDevices(res?.res?.list || [])
    } catch (error) {
      message.error(t("app.device.libiio.fetchListFailed", "Failed to load device list"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadDevices()
  }, [loadDevices])

  const getGatewayModules = useCallback(
    (device: LibiioDevice) => {
      return modules.find((module) => module.ip && module.ip === device.ip)
    },
    [modules],
  )

  const goToFrequencyConfig = useCallback((module: LibiioModule, direction: "rx" | "tx") => {
    history.push(`/device/libiio/config/${module.id}?direction=${direction}`)
  }, [])

  const openEditModal = useCallback(
    (device: LibiioDevice, module?: LibiioModule) => {
      setEditingDevice(device)
      setEditingModule(module)
      editForm.setFieldsValue({
        ip: device.ip || module?.ip || "",
        fs_dbm: typeof module?.fs_dbm === "number" ? module.fs_dbm : undefined,
        rx_ip: module?.rx_ip || "",
        rx_center_freq: module?.rx_center_freq ?? module?.center_freq,
        rx_sampling_rate: module?.rx_sampling_rate ?? module?.sampling_rate,
        rx_fft_size: module?.rx_fft_size ?? module?.fft_size,
        rx_gain: module?.rx_gain,
        tx_ip: module?.tx_ip || "",
        tx_center_freq: module?.tx_center_freq ?? module?.center_freq,
        tx_sampling_rate: module?.tx_sampling_rate ?? module?.sampling_rate,
        tx_fft_size: module?.tx_fft_size ?? module?.fft_size,
        tx_gain: module?.tx_gain,
      })
      setEditModalVisible(true)
    },
    [editForm],
  )

  const closeEditModal = useCallback(() => {
    setEditModalVisible(false)
    setEditingDevice(null)
    setEditingModule(undefined)
    editForm.resetFields()
  }, [editForm])

  const handleEditSubmit = useCallback(async () => {
    if (!editingDevice) {
      return
    }

    try {
      const values = await editForm.validateFields()
      const rxCenterFreq = values.rx_center_freq as number
      const rxSamplingRate = values.rx_sampling_rate as number
      const rxFftSize = values.rx_fft_size as number
      setSubmitLoading(true)

      await Services.api.postLibiioDeviceSave(
        {
          id: editingModule?.id,
          ip: values.ip,
          type: editingModule?.type,
          center_freq: editingModule?.center_freq ?? rxCenterFreq,
          sampling_rate: editingModule?.sampling_rate ?? rxSamplingRate,
          fft_size: editingModule?.fft_size ?? rxFftSize,
          fs_dbm: values.fs_dbm,
          rx_ip: values.rx_ip,
          rx_center_freq: values.rx_center_freq,
          rx_sampling_rate: values.rx_sampling_rate,
          rx_fft_size: values.rx_fft_size,
          rx_gain: values.rx_gain,
          tx_ip: values.tx_ip,
          tx_center_freq: values.tx_center_freq,
          tx_sampling_rate: values.tx_sampling_rate,
          tx_fft_size: values.tx_fft_size,
          tx_gain: values.tx_gain,
        },
        { showLoading: false },
      )

      message.success(t("app.device.libiio.updateSuccess", "Libiio device updated"))
      closeEditModal()
      loadDevices()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      message.error(t("app.device.libiio.saveFailed", "Save failed. Please try again later."))
    } finally {
      setSubmitLoading(false)
    }
  }, [closeEditModal, editForm, editingDevice, editingModule, loadDevices, t])

  const getModuleFieldLabel = useCallback(
    (key: string) => {
      const labelMap: Record<string, string> = {
        rx_center_freq: t("app.device.libiio.centerFrequency", "Center Frequency"),
        tx_center_freq: t("app.device.libiio.centerFrequency", "Center Frequency"),
        rx_sampling_rate: t("app.device.libiio.samplingRate", "Bandwidth"),
        tx_sampling_rate: t("app.device.libiio.samplingRate", "Bandwidth"),
        rx_fft_size: t("app.device.libiio.fftSize", "FFT Size"),
        tx_fft_size: t("app.device.libiio.fftSize", "FFT Size"),
        rx_gain: t("app.device.libiio.rxGain", "RX Gain"),
        tx_gain: t("app.device.libiio.txGain", "TX Gain"),
        tx_power: t("app.device.libiio.txPower", "TX Power"),
        rx_rssi: t("app.device.libiio.rxRssi", "RX RSSI"),
      }

      return labelMap[key] || formatFieldName(key)
    },
    [t],
  )

  const getModuleFields = useCallback(
    (module: LibiioModule, prefix: "rx" | "tx") => {
      return Object.entries(module)
        .filter(([key]) => key.toLowerCase().startsWith(prefix))
        .filter(([key]) => !COMMON_MODULE_FIELDS.has(key))
        .map(([key, value]) => ({
          key,
          label: getModuleFieldLabel(key),
          value: formatModuleFieldValue(value, key),
        }))
    },
    [getModuleFieldLabel],
  )

  const renderModuleInfo = useCallback(
    (
      title: string,
      module: LibiioModule | undefined,
      fields: LibiioModuleField[],
      direction: "rx" | "tx",
    ) => (
      <div className="libiio-module-card">
        <div className="libiio-module-card__header">
          <div>
            <span className="libiio-module-card__title">{title}</span>
          </div>
          {module ? (
            <Button
              type="link"
              className="libiio-module-card__config"
              icon={<RadarChartOutlined />}
              onClick={() => goToFrequencyConfig(module, direction)}
            >
              {t("app.device.libiio.config.title", "Frequency Config")}
            </Button>
          ) : null}
        </div>
        {module ? (
          <div className="libiio-module-card__content">
            {fields.length ? (
              fields.map((field) => (
                <div className="libiio-module-field" key={field.key}>
                  <span>{field.label}</span>
                  <strong title={String(field.value)}>{String(field.value)}</strong>
                </div>
              ))
            ) : (
              <div className="libiio-module-empty libiio-module-empty--compact">
                {t("app.device.libiio.moduleNoParameter", "No module parameters")}
              </div>
            )}
          </div>
        ) : (
          <div className="libiio-module-empty">
            {t("app.device.libiio.moduleNotConfigured", "Module not configured")}
          </div>
        )}
      </div>
    ),
    [goToFrequencyConfig, t],
  )

  return (
    <PageContainer className="libiio-page" title={false}>
      <div className="libiio-page-shell">
        <Spin spinning={loading}>
          {devices.length ? (
            <div className="libiio-device-list">
              {devices.map((device) => {
                const module = getGatewayModules(device)
                const rxFields = module ? getModuleFields(module, "rx") : []
                const txFields = module ? getModuleFields(module, "tx") : []

                return (
                  <Card className="libiio-device-card" key={device.id} bordered={false}>
                    <div className="libiio-device-header">
                      <div className="libiio-device-action-row">
                        <Tooltip title={t("app.common.edit", "Edit")}>
                          <Button
                            className="libiio-device-edit"
                            icon={<EditOutlined />}
                            type="text"
                            onClick={() => openEditModal(device, module)}
                          >
                            {t("app.common.edit", "Edit")}
                          </Button>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="libiio-device-meta-row">
                      <div className="libiio-device-meta-item">
                        <span>{t("app.device.libiio.ipAddress", "IP Address")}</span>
                        <strong title={device.ip || "-"}>{device.ip || "-"}</strong>
                      </div>
                      <div className="libiio-device-meta-item">
                        <span>
                          {t("app.device.libiio.fullScalePower", "0 dBFS Full-scale Power")}
                        </span>
                        <strong title={String(formatModuleFieldValue(module?.fs_dbm))}>
                          {formatModuleFieldValue(module?.fs_dbm)}
                        </strong>
                      </div>
                    </div>

                    <div className="libiio-module-grid">
                      {renderModuleInfo(
                        t("app.device.libiio.module.tx", "TX Module"),
                        module,
                        txFields,
                        "tx",
                      )}
                      {renderModuleInfo(
                        t("app.device.libiio.module.rx", "RX Module"),
                        module,
                        rxFields,
                        "rx",
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Empty description={t("app.device.libiio.empty", "No Libiio devices")} />
          )}
        </Spin>
      </div>

      <Modal
        title={t("app.device.libiio.editInfo", "Edit Libiio Device")}
        open={editModalVisible}
        confirmLoading={submitLoading}
        onOk={handleEditSubmit}
        onCancel={closeEditModal}
        width={760}
      >
        <Form className="libiio-edit-form" form={editForm} layout="vertical">
          <div className="libiio-edit-section">
            <div className="libiio-edit-section__title">
              {t("app.device.libiio.deviceParameters", "Device Parameters")}
            </div>
            <div className="libiio-edit-grid libiio-edit-grid--device">
              <Form.Item
                name="ip"
                label={t("app.device.libiio.ipAddress", "IP Address")}
                rules={[
                  {
                    required: true,
                    message: t("app.device.index.ip.required", "Please enter the IP address"),
                  },
                  {
                    pattern: IPV4_REGEXP,
                    message: t("app.device.libiio.ipInvalid", "Please enter a valid IPv4 address"),
                  },
                ]}
              >
                <Input
                  disabled
                  placeholder={t("app.device.libiio.ipExample", "For example, 192.168.1.20")}
                />
              </Form.Item>
              <Form.Item
                name="fs_dbm"
                label={t("app.device.libiio.fullScalePower", "0 dBFS Full-scale Power")}
              >
                <InputNumber style={{ width: "100%" }} precision={2} addonAfter="dBm" />
              </Form.Item>
            </div>
          </div>

          {(["tx", "rx"] as const).map((direction) => (
            <div className="libiio-edit-section" key={direction}>
              <div className="libiio-edit-section__title">
                {direction === "rx"
                  ? t("app.device.libiio.module.rx", "RX Module")
                  : t("app.device.libiio.module.tx", "TX Module")}
              </div>
              <div className="libiio-edit-grid">
                <Form.Item
                  name={`${direction}_ip`}
                  label="IP"
                  rules={[
                    {
                      pattern: IPV4_REGEXP,
                      message: t(
                        "app.device.libiio.ipInvalid",
                        "Please enter a valid IPv4 address",
                      ),
                    },
                  ]}
                >
                  <Input
                    placeholder={t("app.device.libiio.ipExample", "For example, 192.168.1.20")}
                  />
                </Form.Item>
                <Form.Item
                  name={`${direction}_center_freq`}
                  label={t("app.device.libiio.centerFrequency", "Center Frequency")}
                  dependencies={direction === "tx" ? ["tx_ip"] : undefined}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const isRequired = direction === "rx" || Boolean(getFieldValue("tx_ip"))
                        if (isRequired && (value === undefined || value === null || value === "")) {
                          return Promise.reject(
                            new Error(
                              t(
                                "app.device.libiio.centerFrequencyRequired",
                                "Please enter center frequency",
                              ),
                            ),
                          )
                        }
                        return Promise.resolve()
                      },
                    }),
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} precision={2} addonAfter="MHz" />
                </Form.Item>
                <Form.Item
                  name={`${direction}_sampling_rate`}
                  label={t("app.device.libiio.samplingRate", "Bandwidth")}
                  dependencies={direction === "tx" ? ["tx_ip"] : undefined}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const isRequired = direction === "rx" || Boolean(getFieldValue("tx_ip"))
                        if (isRequired && (value === undefined || value === null || value === "")) {
                          return Promise.reject(
                            new Error(
                              t("app.device.libiio.samplingRateRequired", "Please enter bandwidth"),
                            ),
                          )
                        }
                        return Promise.resolve()
                      },
                    }),
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} precision={2} addonAfter="MHz" />
                </Form.Item>
                <Form.Item
                  name={`${direction}_fft_size`}
                  label={t("app.device.libiio.fftSize", "FFT Size")}
                  dependencies={direction === "tx" ? ["tx_ip"] : undefined}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const isRequired = direction === "rx" || Boolean(getFieldValue("tx_ip"))
                        if (isRequired && (value === undefined || value === null || value === "")) {
                          return Promise.reject(
                            new Error(
                              t("app.device.libiio.fftSizeRequired", "Please select FFT size"),
                            ),
                          )
                        }
                        return Promise.resolve()
                      },
                    }),
                  ]}
                >
                  <Select
                    options={FFT_SIZE_OPTIONS}
                    placeholder={t(
                      "app.device.libiio.fftSizePlaceholder",
                      "Please select FFT size",
                    )}
                  />
                </Form.Item>
                <Form.Item
                  name={`${direction}_gain`}
                  label={
                    direction === "rx"
                      ? t("app.device.libiio.rxGain", "RX Gain")
                      : t("app.device.libiio.txGain", "TX Gain")
                  }
                >
                  <InputNumber style={{ width: "100%" }} precision={2} addonAfter="dB" />
                </Form.Item>
              </div>
            </div>
          ))}
        </Form>
      </Modal>
    </PageContainer>
  )
}

export default DeviceLibiio

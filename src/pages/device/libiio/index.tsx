import { PageContainer } from "@ant-design/pro-components"
import { Button, Card, Col, message, Row, Spin } from "antd"
import { RadarChartOutlined } from "@ant-design/icons"
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

const MAX_FETCH_SIZE = 1000
const LIBIIO_DEVICE_TYPE = "E0"

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

const formatModuleFieldValue = (value: any) => {
  if (value === undefined || value === null || value === "") {
    return "-"
  }
  if (Array.isArray(value)) {
    return value.length
  }
  if (typeof value === "object") {
    return JSON.stringify(value)
  }
  return value
}

const DeviceLibiio: React.FC = () => {
  const intl = useIntl()
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState<LibiioDevice[]>([])
  const [modules, setModules] = useState<LibiioModule[]>([])
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
      console.error("获取 Libiio 设备失败:", error)
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

  const getModuleFields = useCallback((module: LibiioModule, prefix: "rx" | "tx") => {
    return Object.entries(module)
      .filter(([key]) => key.toLowerCase().startsWith(prefix))
      .filter(([key]) => !COMMON_MODULE_FIELDS.has(key))
      .map(([key, value]) => ({
        key,
        label: key,
        value: formatModuleFieldValue(value),
      }))
  }, [])

  const renderModuleInfo = useCallback(
    (
      title: string,
      module: LibiioModule | undefined,
      fields: LibiioModuleField[],
      direction: "rx" | "tx",
    ) => (
      <div className="libiio-module-card">
        <div className="libiio-module-card__header">
          <span className="libiio-module-card__title">{title}</span>
          {module && fields.length ? (
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
        {module && fields.length ? (
          <div className="libiio-module-card__content">
            {fields.map((field) => (
              <div className="libiio-module-field" key={field.key}>
                <span>{field.label}</span>
                <strong>{String(field.value)}</strong>
              </div>
            ))}
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
    <PageContainer className="libiio-page">
      <Card className="libiio-table-card" bodyStyle={{ padding: 8 }}>
        <Spin spinning={loading}>
          <Row gutter={[4, 8]}>
            {devices.map((device) => (
              <Col key={device.id} xs={24} xl={12}>
                <Card className="libiio-device-card">
                  {(() => {
                    const module = getGatewayModules(device)
                    const rxFields = module ? getModuleFields(module, "rx") : []
                    const txFields = module ? getModuleFields(module, "tx") : []

                    return (
                      <>
                        <div className="libiio-device-card__header">
                          <div>
                            <div className="libiio-device-card__eyebrow">
                              {t("app.device.libiio.gatewayName", "Gateway Device Name")}
                            </div>
                            <div className="libiio-device-card__title">{device.ip || "-"}</div>
                          </div>
                          <div className="libiio-shared-pill">
                            <span>{t("app.device.libiio.fsDbm", "FS (dBm)")}</span>
                            <strong>{formatModuleFieldValue(module?.fs_dbm)}</strong>
                          </div>
                        </div>

                        <div className="libiio-module-grid">
                          {renderModuleInfo(
                            t("app.device.libiio.module.rx", "RX Module"),
                            module,
                            rxFields,
                            "rx",
                          )}
                          {renderModuleInfo(
                            t("app.device.libiio.module.tx", "TX Module"),
                            module,
                            txFields,
                            "tx",
                          )}
                        </div>
                      </>
                    )
                  })()}
                </Card>
              </Col>
            ))}
          </Row>
        </Spin>
      </Card>
    </PageContainer>
  )
}

export default DeviceLibiio

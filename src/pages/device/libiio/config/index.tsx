import { PageContainer } from "@ant-design/pro-components"
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Spin,
} from "antd"
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { history, useIntl } from "umi"
import Services from "@/pages/device/services"
import type {
  API_PostLibiioDeviceConfigDelete,
  API_PostLibiioDeviceConfigList,
  API_PostLibiioDeviceConfigSave,
} from "@/pages/device/services/typings/device"
import "./index.less"

type FrequencyConfigPageProps = {
  match?: {
    params?: {
      deviceId?: string
    }
  }
}

const createEmptyConfigItem = (): API_PostLibiioDeviceConfigSave.Params => ({
  device_id: 0,
  sort: undefined,
  target_freq_mhz: 0,
  fs_dbm: undefined,
  rx_gain: undefined,
  is_alarm: 1,
  min: undefined,
  max: undefined,
})

const sortConfigs = <T extends { sort?: number; id?: number }>(configs: T[]) =>
  [...configs].sort((prev, next) => {
    const prevSort = typeof prev.sort === "number" ? prev.sort : Number.MAX_SAFE_INTEGER
    const nextSort = typeof next.sort === "number" ? next.sort : Number.MAX_SAFE_INTEGER

    if (prevSort !== nextSort) {
      return prevSort - nextSort
    }

    return (prev.id || 0) - (next.id || 0)
  })

const buildConfigList = (configs?: API_PostLibiioDeviceConfigList.ConfigItem[]) =>
  sortConfigs(configs || []).map((config) => ({
    id: config.id,
    device_id: config.device_id,
    sort: config.sort,
    target_freq_mhz: config.target_freq_mhz,
    fs_dbm: config.fs_dbm,
    rx_gain: config.rx_gain,
    is_alarm: config.is_alarm,
    min: config.min,
    max: config.max,
  }))

const FrequencyConfigPage: React.FC<FrequencyConfigPageProps> = (props) => {
  const intl = useIntl()
  const [form] = Form.useForm<{ configs: API_PostLibiioDeviceConfigSave.Params[] }>()
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [initialIds, setInitialIds] = useState<number[]>([])
  const t = useCallback(
    (id: string, defaultMessage: string, values?: Record<string, string | number>) =>
      intl.formatMessage({ id, defaultMessage }, values),
    [intl],
  )

  const deviceId = Number(props.match?.params?.deviceId)
  const isValidDeviceId = Number.isFinite(deviceId) && deviceId > 0

  const loadPageData = useCallback(async () => {
    if (!isValidDeviceId) {
      return
    }

    try {
      setLoading(true)
      const configRes = await Services.api.postLibiioDeviceConfigList(
        {
          page: 1,
          limit: 200,
          device_id: deviceId,
        },
        {
          showLoading: false,
          showToast: false,
        },
      )

      const configs = sortConfigs(configRes?.res?.list || [])
      setInitialIds(configs.map((item) => item.id).filter(Boolean) as number[])
      form.setFieldsValue({
        configs: configs.length ? buildConfigList(configs) : [createEmptyConfigItem()],
      })
    } catch (error) {
      console.error("获取频点配置页面数据失败:", error)
      message.error(t("app.device.libiio.config.fetchFailed", "Failed to load frequency config"))
    } finally {
      setLoading(false)
    }
  }, [deviceId, form, isValidDeviceId, t])

  useEffect(() => {
    loadPageData()
  }, [loadPageData])

  const handleSave = useCallback(async () => {
    if (!isValidDeviceId) {
      message.error(t("app.device.libiio.config.invalidDevice", "Invalid device parameter"))
      return
    }

    try {
      const values = await form.validateFields()
      setSubmitLoading(true)
      const configs = (values.configs || [])
        .filter((item) => typeof item.target_freq_mhz === "number")
        .map((item, index) => ({
          ...item,
          sort: index + 1,
        }))
      const currentIds = configs.map((item) => item.id).filter(Boolean) as number[]
      const removedIds = initialIds.filter((id) => !currentIds.includes(id))

      await Services.api.postLibiioDeviceConfigSave(
        {
          list: configs.map((item) => ({
            ...item,
            device_id: deviceId,
          })),
        },
        {
          showLoading: false,
          showToast: false,
        },
      )

      await Promise.all(
        removedIds.map((id) =>
          Services.api.postLibiioDeviceConfigDelete(
            { id } as API_PostLibiioDeviceConfigDelete.Params,
            {
              showLoading: false,
              showToast: false,
            },
          ),
        ),
      )

      message.success(t("app.device.libiio.config.saveSuccess", "Frequency config saved"))
      await loadPageData()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      console.error("保存频点配置失败:", error)
      message.error(t("app.device.libiio.config.saveFailed", "Failed to save frequency config"))
    } finally {
      setSubmitLoading(false)
    }
  }, [deviceId, form, initialIds, isValidDeviceId, loadPageData, t])

  const pageTitle = useMemo(() => {
    if (!isValidDeviceId) {
      return t("app.device.libiio.config.title", "Frequency Config")
    }
    return t("app.device.libiio.config.titleWithDevice", "Frequency Config · Device #{deviceId}", {
      deviceId,
    })
  }, [deviceId, isValidDeviceId, t])

  return (
    <PageContainer className="libiio-config-page" title={pageTitle}>
      <Card className="libiio-config-shell">
        <div className="libiio-config-toolbar">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => history.push("/device/libiio")}>
              {t("app.device.libiio.config.backToDevices", "Back to Device List")}
            </Button>
            <Button
              icon={<PlusOutlined />}
              type="dashed"
              onClick={() =>
                form.setFieldValue("configs", [
                  ...(form.getFieldValue("configs") || []),
                  createEmptyConfigItem(),
                ])
              }
            >
              {t("app.device.libiio.config.addFrequency", "Add Frequency")}
            </Button>
          </Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={submitLoading}
            onClick={handleSave}
          >
            {t("app.device.libiio.config.saveConfig", "Save Config")}
          </Button>
        </div>

        <Spin spinning={loading}>
          {!isValidDeviceId ? (
            <Alert
              type="error"
              showIcon
              message={t(
                "app.device.libiio.config.invalidDeviceMessage",
                "Invalid device parameter",
              )}
              description={t(
                "app.device.libiio.config.invalidDeviceDescription",
                "Please return to the device list and enter again.",
              )}
            />
          ) : (
            <>
              <Card className="libiio-config-summary">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label={t("app.device.libiio.deviceId", "Device ID")}>
                    {deviceId}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={t(
                      "app.device.libiio.config.currentFrequencyCount",
                      "Current Frequencies",
                    )}
                  >
                    {(form.getFieldValue("configs") || []).length}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Form form={form} layout="vertical">
                <Form.List name="configs">
                  {(fields, { add, move, remove }) => (
                    <>
                      <div className="libiio-config-grid">
                        {fields.length ? (
                          fields.map((field, index) => (
                            <Card
                              className="libiio-config-card"
                              key={field.key}
                              title={t(
                                "app.device.libiio.config.frequencyWithIndex",
                                "Frequency {index}",
                                {
                                  index: index + 1,
                                },
                              )}
                              extra={
                                <Space size={4}>
                                  <Button
                                    type="link"
                                    icon={<ArrowUpOutlined />}
                                    disabled={index === 0}
                                    onClick={() => move(field.name, field.name - 1)}
                                  >
                                    {t("app.common.moveUp", "Move Up")}
                                  </Button>
                                  <Button
                                    type="link"
                                    icon={<ArrowDownOutlined />}
                                    disabled={index === fields.length - 1}
                                    onClick={() => move(field.name, field.name + 1)}
                                  >
                                    {t("app.common.moveDown", "Move Down")}
                                  </Button>
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(field.name)}
                                  >
                                    {t("app.common.delete", "Delete")}
                                  </Button>
                                </Space>
                              }
                            >
                              <Form.Item {...field} name={[field.name, "id"]} hidden>
                                <InputNumber />
                              </Form.Item>
                              <Form.Item {...field} name={[field.name, "sort"]} hidden>
                                <InputNumber />
                              </Form.Item>
                              <Row gutter={[12, 0]}>
                                <Col xs={24} sm={12} lg={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "target_freq_mhz"]}
                                    label={t(
                                      "app.device.libiio.config.targetFrequency",
                                      "Target Frequency (MHz)",
                                    )}
                                    rules={[
                                      {
                                        required: true,
                                        message: t(
                                          "app.device.libiio.config.targetFrequencyRequired",
                                          "Please enter target frequency",
                                        ),
                                      },
                                    ]}
                                  >
                                    <InputNumber style={{ width: "100%" }} min={0} />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} lg={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "rx_gain"]}
                                    label="RX Gain"
                                  >
                                    <InputNumber style={{ width: "100%" }} />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} lg={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "fs_dbm"]}
                                    label="FS (dBm)"
                                  >
                                    <InputNumber style={{ width: "100%" }} />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} lg={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "is_alarm"]}
                                    label={t("app.device.libiio.config.isAlarm", "Alarm Enabled")}
                                    rules={[
                                      {
                                        required: true,
                                        message: t(
                                          "app.device.libiio.config.isAlarmRequired",
                                          "Please select whether alarm is enabled",
                                        ),
                                      },
                                    ]}
                                  >
                                    <Select
                                      options={[
                                        { label: t("app.common.yes", "Yes"), value: 1 },
                                        { label: t("app.common.no", "No"), value: 0 },
                                      ]}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} lg={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "min"]}
                                    label={t("app.device.libiio.config.minValue", "Minimum")}
                                  >
                                    <InputNumber style={{ width: "100%" }} />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} lg={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "max"]}
                                    label={t("app.device.libiio.config.maxValue", "Maximum")}
                                    dependencies={[[field.name, "min"]]}
                                    rules={[
                                      ({ getFieldValue }) => ({
                                        validator(_, value) {
                                          const min = getFieldValue(["configs", field.name, "min"])
                                          if (
                                            typeof min === "number" &&
                                            typeof value === "number" &&
                                            min > value
                                          ) {
                                            return Promise.reject(
                                              new Error(
                                                t(
                                                  "app.device.libiio.config.maxLessThanMin",
                                                  "Maximum value cannot be less than minimum value",
                                                ),
                                              ),
                                            )
                                          }
                                          return Promise.resolve()
                                        },
                                      }),
                                    ]}
                                  >
                                    <InputNumber style={{ width: "100%" }} />
                                  </Form.Item>
                                </Col>
                              </Row>
                            </Card>
                          ))
                        ) : (
                          <Alert
                            type="info"
                            showIcon
                            message={t(
                              "app.device.libiio.config.emptyMessage",
                              "No frequency config yet",
                            )}
                            description={t(
                              "app.device.libiio.config.emptyDescription",
                              "Click Add Frequency in the upper left to start configuring.",
                            )}
                          />
                        )}
                      </div>
                      {!fields.length && (
                        <div className="libiio-config-empty-action">
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => add(createEmptyConfigItem())}
                          >
                            {t("app.device.libiio.config.addFirstFrequency", "Add First Frequency")}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Form.List>
              </Form>
            </>
          )}
        </Spin>
      </Card>
    </PageContainer>
  )
}

export default FrequencyConfigPage

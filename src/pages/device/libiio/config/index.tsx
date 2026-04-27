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
import { history } from "umi"
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
  const [form] = Form.useForm<{ configs: API_PostLibiioDeviceConfigSave.Params[] }>()
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [initialIds, setInitialIds] = useState<number[]>([])

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
      message.error("获取频点配置失败")
    } finally {
      setLoading(false)
    }
  }, [deviceId, form, isValidDeviceId])

  useEffect(() => {
    loadPageData()
  }, [loadPageData])

  const handleSave = useCallback(async () => {
    if (!isValidDeviceId) {
      message.error("设备参数异常")
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

      message.success("频点配置已保存")
      await loadPageData()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      console.error("保存频点配置失败:", error)
      message.error("保存频点配置失败")
    } finally {
      setSubmitLoading(false)
    }
  }, [deviceId, form, initialIds, isValidDeviceId, loadPageData])

  const pageTitle = useMemo(() => {
    if (!isValidDeviceId) {
      return "频点配置"
    }
    return `频点配置 · 设备 #${deviceId}`
  }, [deviceId, isValidDeviceId])

  return (
    <PageContainer className="libiio-config-page" title={pageTitle}>
      <Card className="libiio-config-shell">
        <div className="libiio-config-toolbar">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => history.push("/device/libiio")}>
              返回设备列表
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
              新增频点
            </Button>
          </Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={submitLoading}
            onClick={handleSave}
          >
            保存配置
          </Button>
        </div>

        <Spin spinning={loading}>
          {!isValidDeviceId ? (
            <Alert
              type="error"
              showIcon
              message="设备参数无效"
              description="请返回设备列表后重新进入。"
            />
          ) : (
            <>
              <Card className="libiio-config-summary">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="设备 ID">{deviceId}</Descriptions.Item>
                  <Descriptions.Item label="当前频点数">
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
                              title={`频点 ${index + 1}`}
                              extra={
                                <Space size={4}>
                                  <Button
                                    type="link"
                                    icon={<ArrowUpOutlined />}
                                    disabled={index === 0}
                                    onClick={() => move(field.name, field.name - 1)}
                                  >
                                    上移
                                  </Button>
                                  <Button
                                    type="link"
                                    icon={<ArrowDownOutlined />}
                                    disabled={index === fields.length - 1}
                                    onClick={() => move(field.name, field.name + 1)}
                                  >
                                    下移
                                  </Button>
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(field.name)}
                                  >
                                    删除
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
                                    label="监听频点 (MHz)"
                                    rules={[{ required: true, message: "请输入监听频点" }]}
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
                                    label="是否告警"
                                    rules={[{ required: true, message: "请选择是否告警" }]}
                                  >
                                    <Select
                                      options={[
                                        { label: "是", value: 1 },
                                        { label: "否", value: 0 },
                                      ]}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} lg={8}>
                                  <Form.Item {...field} name={[field.name, "min"]} label="最小值">
                                    <InputNumber style={{ width: "100%" }} />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} lg={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, "max"]}
                                    label="最大值"
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
                                            return Promise.reject(new Error("最大值不能小于最小值"))
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
                            message="当前没有频点配置"
                            description="点击左上角“新增频点”开始配置。"
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
                            新增第一个频点
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

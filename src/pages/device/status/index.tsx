import { PageContainer } from "@ant-design/pro-components"
import { Card, Col, Row, Tag, Progress, Form, Select, Modal } from "antd"
import React, { useCallback, useEffect, useState } from "react"
import Services from "@/pages/device/services"
import DeviceNameSelect from "@/components/DeviceNameSelect"
import { ArrowDownOutlined, ArrowUpOutlined, CheckOutlined } from "@ant-design/icons"
import { API_PostDeviceList, API_PostDeviceTypes } from "../services/typings/device"
import { SYSTEM_CONFIG } from "@/constants"
const pageSize = 300

const getRefreshInterval = () => {
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

const DeviceStatus: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<API_PostDeviceTypes.List[]>([])
  const [deviceList, setDeviceList] = useState<API_PostDeviceList.List[]>([])
  const [form] = Form.useForm()
  const [deviceId, setDeviceId] = useState<number | null>(null)
  const [showModalVisible, setShowModalVisible] = useState(false)

  const getDeviceTypes = useCallback(async () => {
    const res = await Services.api.postDeviceTypes({})
    if (res) {
      setDeviceTypes(res.res.list)
      return res.res.list
    }
    return []
  }, [])

  const getLists = useCallback(
    async (queryParams: { page?: number; limit?: number; type?: string; ip?: string }) => {
      try {
        const res = await Services.api.postDeviceList(queryParams, {
          showLoading: false,
          showToast: false,
        })
        if (res?.res) {
          setDeviceList(res.res.list || [])
          return {
            total: res.res.total,
            data: res.res.list || [],
            success: true,
          }
        }
        return { success: false }
      } catch (error) {
        console.error("Failed to fetch device list:", error)
        return { success: false }
      }
    },
    [],
  )

  // const onSearch = (values: { type?: string; ip?: string }) => {
  //   getLists({
  //     page: 1,
  //     limit: 300,
  //     ...values,
  //   })
  // }

  useEffect(() => {
    const initData = async () => {
      await getDeviceTypes()
      await getLists({
        limit: pageSize,
        ...form.getFieldsValue(),
      })
    }
    initData().then((r) => console.log(r))
  }, [form, getDeviceTypes, getLists])
  useEffect(() => {
    const intervalId = setInterval(() => {
      getLists({
        limit: pageSize,
        ...form.getFieldsValue(),
      })
    }, getRefreshInterval())
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
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
                options={deviceTypes.map((type) => ({
                  label: `${
                    type.device_type_alias ? type.device_type_alias : type.device_type
                    // : type.device_type_group + "[" + type.device_type + "]"
                  }`,
                  value: type.id,
                }))}
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
        </Row>
      </Form>
      <Row gutter={[24, 24]}>
        {deviceList?.map((device) => {
          return (
            <Col key={device.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                title={`${
                  device.device_type_alias ? device.device_type_alias : device.device_type_group
                }:${device.name}`}
                extra={<Tag color={device.tag_color}>{device.status_text}</Tag>}
                onDoubleClick={() => {
                  setDeviceId(device.id)
                  setShowModalVisible(true)
                }}
                style={{
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.1)",
                  transition: "0.3s",
                  borderRadius: "8px",
                }}
                hoverable
              >
                <Row>
                  {device?.metric_items
                    ?.filter((metricItem) => metricItem.show_in_list)
                    .map((metricItem) => (
                      <>
                        <Col span={8}>{metricItem.config_type_name}</Col>
                        <Col span={12}>
                          {metricItem.is_module ? (
                            metricItem.current_val ? (
                              "在线"
                            ) : (
                              "离线"
                            )
                          ) : ((typeof metricItem.show_max_val === "number" &&
                              metricItem.current_val <= metricItem.show_max_val) ||
                              typeof metricItem.show_max_val !== "number") &&
                            ((typeof metricItem.show_min_val === "number" &&
                              metricItem.current_val > metricItem.show_min_val) ||
                              typeof metricItem.show_min_val !== "number") ? (
                            <Progress
                              percent={
                                ((metricItem.current_val - metricItem?.alarm_min) * 100) /
                                (metricItem?.alarm_max - metricItem?.alarm_min)
                              }
                              steps={5}
                              size="small"
                              showInfo={true}
                              format={() => {
                                // 判断 max_val 是数字且大于 current_val 时显示无穷大
                                if (
                                  typeof metricItem.show_max_val === "number" &&
                                  metricItem.current_val > metricItem.show_max_val
                                ) {
                                  return `∞`
                                }
                                if (
                                  typeof metricItem.show_min_val === "number" &&
                                  metricItem.current_val < metricItem.show_min_val
                                ) {
                                  return `-∞`
                                }
                                return (
                                  <span
                                    style={{
                                      color:
                                        metricItem.is_set_current_val &&
                                        ((typeof metricItem.alarm_min === "number" &&
                                          metricItem.current_val < metricItem.alarm_min) ||
                                          (typeof metricItem.alarm_max === "number" &&
                                            metricItem.current_val > metricItem.alarm_max))
                                          ? "red"
                                          : "",
                                    }}
                                  >
                                    {Number(metricItem.current_val ?? 0).toFixed(2)}{" "}
                                    {metricItem.unit}
                                  </span>
                                )
                              }}
                              strokeColor={
                                (typeof metricItem.alarm_min === "number" &&
                                  metricItem.current_val < metricItem.alarm_min) ||
                                (typeof metricItem.alarm_max === "number" &&
                                  metricItem.current_val > metricItem.alarm_max)
                                  ? "red"
                                  : "green"
                              }
                            />
                          ) : (
                            "-"
                          )}
                        </Col>
                        <Col
                          span={4}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {((typeof metricItem.show_max_val === "number" &&
                            metricItem.current_val <= metricItem.show_max_val) ||
                            typeof metricItem.show_max_val !== "number") &&
                          ((typeof metricItem.show_min_val === "number" &&
                            metricItem.current_val > metricItem.show_min_val) ||
                            typeof metricItem.show_min_val !== "number") &&
                          metricItem.is_set_current_val &&
                          (typeof metricItem.alarm_min == "number" ||
                            typeof metricItem.alarm_max == "number") ? (
                            typeof metricItem.alarm_min == "number" &&
                            metricItem.current_val < metricItem.alarm_min ? (
                              <ArrowDownOutlined style={{ color: "red" }} />
                            ) : typeof metricItem.alarm_max == "number" &&
                              metricItem.current_val > metricItem.alarm_max ? (
                              <ArrowUpOutlined style={{ color: "red" }} />
                            ) : (
                              <CheckOutlined style={{ color: "green" }} />
                            )
                          ) : (
                            <></>
                          )}
                        </Col>
                      </>
                    ))}
                </Row>
              </Card>
            </Col>
          )
        })}
      </Row>

      <Modal
        title={`设备详情`}
        open={showModalVisible}
        onCancel={() => setShowModalVisible(false)}
        footer={null}
      >
        <Card bordered={false}>
          <Row>
            <Col span={8} style={{ backgroundColor: "#f0f0f0" }}>
              设备类型
            </Col>
            <Col span={16} style={{ backgroundColor: "#f0f0f0" }}>
              {deviceList && deviceList?.find((d) => d.id === deviceId)?.device_type_alias}
            </Col>
            <Col span={8}>设备编号</Col>
            <Col span={16}>{deviceList && deviceList?.find((d) => d.id === deviceId)?.name}</Col>
            {deviceList &&
              deviceList?.map((device) => {
                return (
                  device?.id === deviceId &&
                  device.metric_items
                    ?.filter((metricItem) => metricItem.show_in_detail)
                    ?.map((metricItem, index) => {
                      return (
                        <>
                          <Col span={8}>{metricItem.config_type_name}</Col>
                          <Col span={12}>
                            {metricItem.is_module ? (
                              metricItem.current_val ? (
                                "在线"
                              ) : (
                                "离线"
                              )
                            ) : ((typeof metricItem.show_max_val === "number" &&
                                metricItem.current_val <= metricItem.show_max_val) ||
                                typeof metricItem.show_max_val !== "number") &&
                              ((typeof metricItem.show_min_val === "number" &&
                                metricItem.current_val > metricItem.show_min_val) ||
                                typeof metricItem.show_min_val !== "number") ? (
                              <Progress
                                percent={
                                  ((metricItem.current_val - metricItem?.alarm_min) * 100) /
                                  (metricItem?.alarm_max - metricItem?.alarm_min)
                                }
                                steps={5}
                                size="small"
                                showInfo={true}
                                format={() => {
                                  // 判断 max_val 是数字且大于 current_val 时显示无穷大
                                  if (
                                    typeof metricItem.show_max_val === "number" &&
                                    metricItem.current_val > metricItem.show_max_val
                                  ) {
                                    return `∞`
                                  }
                                  if (
                                    typeof metricItem.show_min_val === "number" &&
                                    metricItem.current_val < metricItem.show_min_val
                                  ) {
                                    return `-∞`
                                  }
                                  return (
                                    <span
                                      style={{
                                        color:
                                          metricItem.is_set_current_val &&
                                          ((typeof metricItem.alarm_min === "number" &&
                                            metricItem.current_val < metricItem.alarm_min) ||
                                            (typeof metricItem.alarm_max === "number" &&
                                              metricItem.current_val > metricItem.alarm_max))
                                            ? "red"
                                            : "",
                                      }}
                                    >
                                      {Number(metricItem.current_val ?? 0).toFixed(2)}{" "}
                                      {metricItem.unit}
                                    </span>
                                  )
                                }}
                                strokeColor={
                                  (typeof metricItem.alarm_min === "number" &&
                                    metricItem.current_val < metricItem.alarm_min) ||
                                  (typeof metricItem.alarm_max === "number" &&
                                    metricItem.current_val > metricItem.alarm_max)
                                    ? "red"
                                    : "green"
                                }
                              />
                            ) : (
                              "-"
                            )}
                          </Col>
                          <Col
                            span={4}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {((typeof metricItem.show_max_val === "number" &&
                              metricItem.current_val <= metricItem.show_max_val) ||
                              typeof metricItem.show_max_val !== "number") &&
                            ((typeof metricItem.show_min_val === "number" &&
                              metricItem.current_val > metricItem.show_min_val) ||
                              typeof metricItem.show_min_val !== "number") &&
                            metricItem.is_set_current_val &&
                            (typeof metricItem.alarm_min == "number" ||
                              typeof metricItem.alarm_max == "number") ? (
                              typeof metricItem.alarm_min == "number" &&
                              metricItem.current_val < metricItem.alarm_min ? (
                                <ArrowDownOutlined style={{ color: "red" }} />
                              ) : typeof metricItem.alarm_max == "number" &&
                                metricItem.current_val > metricItem.alarm_max ? (
                                <ArrowUpOutlined style={{ color: "red" }} />
                              ) : (
                                <CheckOutlined style={{ color: "green" }} />
                              )
                            ) : (
                              <></>
                            )}
                          </Col>
                        </>
                      )
                    })
                )
              })}
          </Row>
        </Card>
      </Modal>
    </PageContainer>
  )
}

export default DeviceStatus

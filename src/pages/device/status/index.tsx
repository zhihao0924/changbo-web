import { PageContainer } from "@ant-design/pro-components"
import { Card, Col, Row, Tag, Progress, Form, Select, Modal } from "antd"
import React, { useCallback, useEffect, useState } from "react"
import Services from "@/pages/device/services"
import DeviceNameSelect from "@/components/DeviceNameSelect"
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
const pageSize = 300

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
    }, 500)
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
                          <Progress
                            percent={(metricItem.current_val * 100) / metricItem.threshold_val}
                            steps={10}
                            size="small"
                            showInfo={true}
                            format={() => {
                              // 判断 max_val 是数字且大于 current_val 时显示无穷大
                              if (
                                typeof metricItem.max_val === "number" &&
                                metricItem.current_val > metricItem.max_val
                              ) {
                                return `∞`
                              }
                              if (
                                typeof metricItem.min_val === "number" &&
                                metricItem.current_val < metricItem.min_val
                              ) {
                                return `-∞`
                              }
                              return `${(metricItem.current_val ?? 0).toFixed(2)} ${
                                metricItem.unit
                              }`
                            }}
                            strokeColor={
                              (metricItem.operator == "GT" &&
                                typeof metricItem.threshold_val === "number" &&
                                metricItem.current_val > metricItem.threshold_val) ||
                              (metricItem.operator == "LT" &&
                                typeof metricItem.threshold_val === "number" &&
                                metricItem.current_val < metricItem.threshold_val)
                                ? "red"
                                : "green"
                            }
                          />
                        </Col>
                        <Col
                          span={4}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {typeof metricItem.threshold_val === "number" ? (
                            (metricItem.operator == "GT" &&
                              typeof metricItem.threshold_val === "number" &&
                              metricItem.current_val > metricItem.threshold_val) ||
                            (metricItem.operator == "LT" &&
                              typeof metricItem.threshold_val === "number" &&
                              metricItem.current_val < metricItem.threshold_val) ? (
                              <CloseCircleOutlined style={{ color: "red" }} />
                            ) : (
                              <CheckCircleOutlined style={{ color: "green" }} />
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
        <Row justify="center" align="middle" style={{ width: "100%" }}>
          <Col span={8}>设备类型</Col>
          <Col span={16}>
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
                  ?.map((metricItem) => {
                    return (
                      <>
                        <Col span={8}>{metricItem.config_type_name}</Col>
                        <Col span={12}>
                          <Progress
                            percent={(metricItem.current_val * 100) / metricItem.threshold_val}
                            steps={10}
                            size="small"
                            showInfo={true}
                            format={() => {
                              return `${(metricItem.current_val ?? 0).toFixed(2)}
                              ${metricItem.unit}`
                            }}
                            strokeColor={
                              (metricItem.operator == "GT" &&
                                typeof metricItem.threshold_val === "number" &&
                                metricItem.current_val > metricItem.threshold_val) ||
                              (metricItem.operator == "LT" &&
                                typeof metricItem.threshold_val === "number" &&
                                metricItem.current_val < metricItem.threshold_val)
                                ? "red"
                                : "green"
                            }
                          />
                        </Col>
                        <Col
                          span={4}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {metricItem.current_val > 0 && metricItem.threshold_val > 0 ? (
                            (metricItem.operator == "GT" &&
                              typeof metricItem.threshold_val === "number" &&
                              metricItem.current_val > metricItem.threshold_val) ||
                            (metricItem.operator == "LT" &&
                              typeof metricItem.threshold_val === "number" &&
                              metricItem.current_val < metricItem.threshold_val) ? (
                              <CloseCircleOutlined style={{ color: "red" }} />
                            ) : (
                              <CheckCircleOutlined style={{ color: "green" }} />
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
        </Row>{" "}
      </Modal>
    </PageContainer>
  )
}

export default DeviceStatus

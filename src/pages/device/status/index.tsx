import { PageContainer } from "@ant-design/pro-components"
import { Card, Col, Row, Tag, Progress, Form, Select, Modal, Descriptions } from "antd"
import React, { useCallback, useEffect, useState } from "react"
import { green } from "@ant-design/colors"
import Services from "@/pages/device/services"
import DeviceNameSelect from "@/components/DeviceNameSelect"
const pageSize = 300

const DeviceStatus: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<API_PostDeviceTypes.List[]>([])
  const [deviceList, setDeviceList] = useState<API_PostDeviceList.List[]>([])
  const [form] = Form.useForm()
  const [deviceKey, setDeviceKey] = useState<number | null>(null)
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

  const getDeviceTypeName = (typeKey: string) => {
    return deviceTypes.find((type) => type.key === typeKey)?.value || "未知设备"
  }

  type DeviceStatus = {
    color: string
    text: string
    status: "online" | "offline" | "maintaining"
  }

  const getDeviceStatus = (device: API_PostDeviceList.List): DeviceStatus => {
    if (device.is_maintaining) {
      return { color: "orange", text: "维护中", status: "maintaining" }
    }
    return device.voltage > 0
      ? { color: "green", text: "运行中", status: "online" }
      : { color: "red", text: "离线", status: "offline" }
  }

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
    }, 5000)
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [form, getLists])
  return (
    <PageContainer>
      <Form form={form}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="type" label="设备类型">
              <Select
                placeholder="请选择类型"
                allowClear
                options={deviceTypes.map((type) => ({
                  label: type.value,
                  value: type.key,
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
          {/*<Col xs={24} sm={12} md={8} lg={6}>*/}
          {/*  <Form.Item>*/}
          {/*    <Button*/}
          {/*      type="primary"*/}
          {/*      onClick={() => {*/}
          {/*        onSearch({*/}
          {/*          ...form.getFieldsValue(),*/}
          {/*          page: 1,*/}
          {/*          limit: pageSize,*/}
          {/*        })*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      搜索*/}
          {/*    </Button>*/}
          {/*  </Form.Item>*/}
          {/*</Col>*/}
        </Row>
      </Form>
      <Row gutter={[24, 24]}>
        {deviceList?.map((device) => {
          const status = getDeviceStatus(device)
          return (
            <Col key={device.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                title={`编号：${device.name}`}
                extra={<Tag color={status.color}>{status.text}</Tag>}
                onDoubleClick={() => {
                  setDeviceKey(device.id)
                  setShowModalVisible(true)
                }}
              >
                <>
                  设备位置: {device.position || "-"}
                  <br />
                  电压:
                  {status.status === "online" ? (
                    <Progress
                      percent={device.voltage * 8}
                      steps={10}
                      size="small"
                      strokeColor={green[6]}
                      showInfo={true}
                      format={(percent) => `${((percent ?? 0) / 8).toFixed(2)}V`}
                    />
                  ) : (
                    <>-</>
                  )}
                  <br />
                  电流:{" "}
                  {status.status === "online" ? (
                    <Progress
                      percent={device.current * 200}
                      steps={10}
                      size="small"
                      strokeColor={green[6]}
                      showInfo={true}
                      format={(percent) => `${((percent ?? 0) / 200).toFixed(2)}A`}
                    />
                  ) : (
                    <>-</>
                  )}
                  <br />
                  温度:
                  {status.status === "online" ? (
                    <Progress
                      percent={device.temperature * 2}
                      steps={10}
                      size="small"
                      strokeColor={green[6]}
                      showInfo={true}
                      format={(percent) => `${((percent ?? 0) / 2).toFixed(2)}℃`}
                    />
                  ) : (
                    <>-</>
                  )}
                </>{" "}
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
        <Descriptions column={1} key={1}>
          {deviceList.map((device) => {
            if (device.id === deviceKey) {
              return (
                <Descriptions.Item label="设备编号" key={1}>
                  {device.name}
                </Descriptions.Item>
              )
            }
          })}
        </Descriptions>
      </Modal>
    </PageContainer>
  )
}

export default DeviceStatus

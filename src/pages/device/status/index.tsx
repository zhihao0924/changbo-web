import { PageContainer } from "@ant-design/pro-components"
import { Card, Col, Row, Tag, Progress, Form, Input, Select, Button, Pagination } from "antd"
import React, { useCallback, useEffect, useState } from "react"
import { green } from "@ant-design/colors"
import Services from "@/pages/device/services"

const DeviceStatus: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<API_PostDeviceTypes.List[]>([])
  const [deviceList, setDeviceList] = useState<API_PostDeviceList.List[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  })
  const [form] = Form.useForm()
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
          setPagination({
            current: queryParams.page || 1,
            pageSize: queryParams.limit || pagination.pageSize,
            total: res.res.total || 0,
          })
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
    [pagination.pageSize],
  )
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getLists({
            page: pagination.current,
            limit: pagination.pageSize,
          }),
          getDeviceTypes(),
        ])
      } catch (error) {
        console.error("Failed to fetch device data:", error)
      }
    }
    fetchData()
  }, [])

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

  const onSearch = (values: { type?: string; ip?: string }) => {
    getLists({
      page: 1,
      limit: pagination.pageSize,
      ...values,
    })
  }

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
            <Form.Item name="ip" label="ip地址">
              <Input placeholder="请输入ip地址" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item>
              <Button
                type="primary"
                onClick={() => {
                  onSearch({
                    ...form.getFieldsValue(),
                    page: 1,
                    limit: pagination.pageSize,
                  })
                }}
              >
                搜索
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Row gutter={[24, 24]}>
        {deviceList?.map((device) => {
          const status = getDeviceStatus(device)
          return (
            <Col key={device.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                title={`${getDeviceTypeName(device.type)}-${device.name}`}
                extra={<Tag color={status.color}>{status.text}</Tag>}
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
                      format={(percent) => `${(percent / 8 ?? 0).toFixed(2)}V`}
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
                      format={(percent) => `${(percent / 200 ?? 0).toFixed(2)}A`}
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
                      format={(percent) => `${(percent / 2 ?? 0).toFixed(2)}℃`}
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
      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={(page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize,
            })
            getLists({
              ...form.getFieldsValue(),
              page,
              limit: pageSize,
            })
          }}
          pageSizeOptions={[8, 12, 16, 32]}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `共 ${total} 条数据`}
        />
      </div>
    </PageContainer>
  )
}

export default DeviceStatus

import { PageContainer } from "@ant-design/pro-components"
import { Card, Col, Row, Tag, Progress, Form, Input, Select, Button, Pagination } from "antd"
import React, { useCallback, useEffect, useState, useRef } from "react"
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
  const timerRef = useRef<NodeJS.Timeout>()

  const startPolling = useCallback(() => {
    // 清除现有定时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    // 启动新轮询
    timerRef.current = setInterval(() => {
      getLists({
        page: pagination.current,
        limit: pagination.pageSize,
        ...form.getFieldsValue(),
      }) // 标记为轮询请求
    }, 3000)
  }, [pagination.current, pagination.pageSize, form])

  const getDeviceTypes = useCallback(async () => {
    const res = await Services.api.postDeviceTypes({})
    if (res) {
      setDeviceTypes(res.res.list)
      return res.res.list
    }
    return []
  }, [])

  const getLists = useCallback(async (queryParams) => {
    console.log("请求参数:", JSON.stringify(queryParams, null, 2))
    const res = await Services.api.postDeviceList(queryParams, {
      showLoading: false,
      showToast: false,
    })
    console.log("响应数据:", res?.res)
    if (res) {
      setDeviceList(res.res.list || [])
      // 仅当不是轮询请求时更新分页状态
      setPagination((prev) => ({
        ...prev,
        current: queryParams.page || 1,
        pageSize: queryParams.limit,
        total: res.res.total,
      }))
      return Promise.resolve({
        total: res.res.total,
        data: res.res.list || [],
        success: true,
      })
    }
    return {}
  }, [])

  useEffect(() => {
    // 初始加载数据
    getLists({
      page: pagination.current,
      limit: pagination.pageSize,
      ...form.getFieldsValue(),
    })

    // 启动轮询
    startPolling()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [pagination.current, pagination.pageSize, form])

  useEffect(() => {
    getDeviceTypes()
  }, [getDeviceTypes])

  const getDeviceTypeName = (typeKey: string) => {
    return deviceTypes.find((type) => type.key === typeKey)?.value || "未知设备"
  }

  const getDeviceStatus = (device: API_PostDeviceList.List) => {
    if (device.is_maintaining) return { color: "orange", text: "维护中", status: "maintaining" }
    return device.voltage > 0
      ? { color: "green", text: "运行中", status: "online" }
      : { color: "red", text: "离线", status: "offline" }
  }

  const onSearch = (values: any) => {
    getLists({
      page: values.page,
      limit: values.pageSize,
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
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item>
              <Button
                type="primary"
                onClick={() => {
                  onSearch({
                    ...form.getFieldsValue(),
                    current: 1,
                    pageSize: pagination.pageSize,
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
            // clearInterval(timerRef.current)
            getLists({
              page,
              limit: pageSize,
              ...form.getFieldsValue(),
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

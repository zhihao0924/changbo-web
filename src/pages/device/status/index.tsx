import { PageContainer } from "@ant-design/pro-components"
import { Card, Col, Row, Tag, Spin, Progress } from "antd"
import React, { useCallback, useEffect, useState } from "react"
import { green } from "@ant-design/colors"
import Services from "@/pages/device/services"

const DeviceStatus: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = useState<API_PostDeviceTypes.List[]>([])
  const [deviceList, setDeviceList] = useState<API_PostDeviceList.List[]>([])
  const [loading, setLoading] = useState(false)

  const getDeviceTypes = useCallback(async () => {
    const res = await Services.api.postDeviceTypes({})
    if (res) {
      setDeviceTypes(res.res.list)
      return res.res.list
    }
    return []
  }, [])

  const getLists = useCallback(async (params: any) => {
    const data = {
      page: params.current,
      limit: params.pageSize,
      ...params,
    }
    delete data.current
    delete data.pageSize

    const res = await Services.api.postDeviceList(data)
    if (res) {
      setDeviceList(res.res.list || [])
      return Promise.resolve({
        total: res.res.total,
        data: res.res.list || [],
        success: true,
      })
    }
    return {}
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getDeviceTypes(), getLists({ current: 1, pageSize: 100 })])
      } finally {
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 500)
    return () => clearInterval(interval)
  }, [getDeviceTypes, getLists])

  const getDeviceTypeName = (typeKey: string) => {
    return deviceTypes.find((type) => type.key === typeKey)?.value || "未知设备"
  }

  const getDeviceStatus = (device: API_PostDeviceList.List) => {
    if (device.is_maintaining) return { color: "orange", text: "维护中", status: "maintaining" }
    return device.voltage > 0
      ? { color: "green", text: "运行中", status: "online" }
      : { color: "red", text: "离线", status: "offline" }
  }

  return (
    <PageContainer>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
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
                        percent={(device.voltage * 100) / 20}
                        steps={10}
                        size="small"
                        strokeColor={green[6]}
                        showInfo={true}
                        format={(percent) => `${((percent / 100) * 20).toFixed(2)}V`}
                      />
                    ) : (
                      <>-</>
                    )}
                    <br />
                    电流:{" "}
                    {status.status === "online" ? (
                      <Progress
                        percent={device.current * 100}
                        steps={10}
                        size="small"
                        strokeColor={green[6]}
                        showInfo={true}
                        format={(percent) => `${(percent / 100).toFixed(2)}A`}
                      />
                    ) : (
                      <>-</>
                    )}
                    <br />
                    温度:
                    {status.status === "online" ? (
                      <Progress
                        percent={(device.temperature * 100) / 40}
                        steps={10}
                        size="small"
                        strokeColor={green[6]}
                        showInfo={true}
                        format={(percent) => `${((percent / 100) * 40).toFixed(2)}℃`}
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
      </Spin>
    </PageContainer>
  )
}

export default DeviceStatus

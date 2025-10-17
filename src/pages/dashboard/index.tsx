import React, { useState, useEffect } from "react"
import { Card, Row, Col, Statistic, Tag, Progress, Typography } from "antd"
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import { Pie, Column, Sunburst } from "@ant-design/charts"
import styles from "./index.less"

const { Title } = Typography

const deviceData = [
  { name: "发射合路器", total: 15, running: 12, status: "normal" },
  { name: "接收分路器", total: 8, running: 7, status: "normal" },
  { name: "带通双工器", total: 5, running: 4, status: "warning" },
  { name: "上行信号剥离器", total: 3, running: 3, status: "normal" },
  { name: "下行信号剥离器", total: 6, running: 5, status: "normal" },
  { name: "数字近端机", total: 10, running: 8, status: "normal" },
  { name: "数字远端机", total: 11, running: 9, status: "normal" },
  { name: "模拟近端机", total: 4, running: 3, status: "error" },
  { name: "模拟远端机", total: 12, running: 10, status: "warning" },
  { name: "干线放大器", total: 2, running: 2, status: "normal" },
]

const getStatusTag = (status: string) => {
  switch (status) {
    case "normal":
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          运行正常
        </Tag>
      )
    case "warning":
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="warning">
          部分异常
        </Tag>
      )
    case "error":
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          故障
        </Tag>
      )
    default:
      return <Tag>未知</Tag>
  }
}

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 状态分布数据
  const statusData = [
    { type: "正常", value: deviceData.filter((d) => d.status === "normal").length },
    { type: "警告", value: deviceData.filter((d) => d.status === "warning").length },
    { type: "故障", value: deviceData.filter((d) => d.status === "error").length },
  ]

  const sunburstData = {
    name: "设备统计",
    children: [
      {
        name: "发射合路器",
        children: [
          {
            name: "B2",
            value: 3,
          },
          {
            name: "B3",
            value: 3,
          },
          {
            name: "B4",
            value: 3,
          },
          {
            name: "B6",
            value: 3,
          },
          {
            name: "B8",
            value: 3,
          },
        ],
      },
      {
        name: "接收分路器",
        children: [
          { name: "C4", value: 2 },
          { name: "C6", value: 3 },
          { name: "C8", value: 3 },
        ],
      },
      {
        name: "带通双工器",
        children: [{ name: "DE", value: 2 }],
      },
      {
        name: "上行信号剥离器",
        children: [
          { name: "F4", value: 2 },
          { name: "F8", value: 8 },
        ],
      },
      {
        name: "下行信号剥离器",
        children: [],
      },
      {
        name: "数字近端机",
        children: [],
      },
      {
        name: "数字远端机",
        children: [],
      },
      {
        name: "模拟近端机",
        children: [],
      },
      {
        name: "模拟远端机",
        children: [],
      },
      {
        name: "干线放大器",
        children: [],
      },
    ],
  }
  // 4、设备名称：上行信号剥离器
  // 设备类型：F4 F8
  // 5、设备名称：下行信号剥离器
  // 设备类型：D4 D8
  // 6、设备名称：数字近端机
  // 设备类型：ED EB
  // 7、设备名称：数字远端机
  // 设备类型：DD DB
  // 8、设备名称：模拟近端机
  // 设备类型：E9 E8 E4 E2
  // 9、设备名称：模拟远端机
  // 设备类型：D1
  // 10、设备名称：干线放大器
  // 设备类型：F1

  // 设备数量数据
  const deviceCountData = deviceData.map((device) => ({
    name: device.name,
    total: device.total,
    running: device.running,
  }))

  return (
    <div className={styles.container}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 0 }}>
          设备监控看板
        </Title>
        <Title level={4} type="secondary">
          {currentTime.toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}
        </Title>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="设备状态分布">
            <Pie
              data={statusData}
              angleField="value"
              colorField="type"
              radius={0.8}
              label={{
                type: "spider",
                content: "{name}: {percentage}",
                style: {
                  fill: "#1a1a1a",
                  fontSize: 12,
                },
              }}
              color={["#389e0d", "#d48806", "#cf1322"]}
              tooltip={{
                domStyles: {
                  "g2-tooltip": {
                    color: "#1a1a1a",
                  },
                },
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="设备类型统计">
            <Sunburst
              data={sunburstData}
              tooltip={{
                domStyles: {
                  "g2-tooltip": {
                    color: "#1a1a1a",
                  },
                },
              }}
            />
          </Card>
        </Col>
        {/*<Col span={12}>*/}
        {/*  <Card title="设备数量统计">*/}
        {/*    <Column*/}
        {/*      data={deviceCountData}*/}
        {/*      xField="name"*/}
        {/*      yField="total"*/}
        {/*      seriesField="name"*/}
        {/*      isGroup={true}*/}
        {/*      columnStyle={{ radius: [4, 4, 0, 0] }}*/}
        {/*      color={["#096dd9", "#1890ff", "#40a9ff", "#69c0ff", "#91d5ff"]}*/}
        {/*      label={{*/}
        {/*        position: "middle",*/}
        {/*        style: {*/}
        {/*          fill: "#1a1a1a",*/}
        {/*          fontWeight: "bold",*/}
        {/*        },*/}
        {/*      }}*/}
        {/*      tooltip={{*/}
        {/*        domStyles: {*/}
        {/*          "g2-tooltip": {*/}
        {/*            color: "#1a1a1a",*/}
        {/*          },*/}
        {/*        },*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  </Card>*/}
        {/*</Col>*/}
      </Row>

      <Row gutter={16}>
        {deviceData.map((device, index) => (
          <Col span={6} key={index} style={{ marginBottom: 16 }}>
            <Card title={device.name}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="总数" value={device.total} />
                </Col>
                <Col span={12}>
                  <Statistic title="运行中" value={device.running} />
                </Col>
              </Row>
              <div style={{ marginTop: 16 }}>
                {getStatusTag(device.status)}
                <Progress
                  percent={Math.round((device.running / device.total) * 100)}
                  status={device.status === "error" ? "exception" : "normal"}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default Dashboard

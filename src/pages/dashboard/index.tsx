import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Progress, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Pie, Column } from '@ant-design/charts';
import styles from './index.less';

const { Title } = Typography;

const deviceData = [
  { name: '服务器', total: 15, running: 12, status: 'normal' },
  { name: '交换机', total: 8, running: 7, status: 'normal' },
  { name: '路由器', total: 5, running: 4, status: 'warning' },
  { name: '防火墙', total: 3, running: 3, status: 'normal' },
  { name: '存储设备', total: 6, running: 5, status: 'normal' },
  { name: '工作站', total: 20, running: 18, status: 'normal' },
  { name: '打印机', total: 4, running: 3, status: 'error' },
  { name: '摄像头', total: 12, running: 10, status: 'warning' },
  { name: '门禁系统', total: 2, running: 2, status: 'normal' },
  { name: '传感器', total: 25, running: 22, status: 'normal' },
];

const getStatusTag = (status: string) => {
  switch (status) {
    case 'normal':
      return <Tag icon={<CheckCircleOutlined />} color="success">运行正常</Tag>;
    case 'warning':
      return <Tag icon={<ExclamationCircleOutlined />} color="warning">部分异常</Tag>;
    case 'error':
      return <Tag icon={<CloseCircleOutlined />} color="error">故障</Tag>;
    default:
      return <Tag>未知</Tag>;
  }
};

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 状态分布数据
  const statusData = [
    { type: '正常', value: deviceData.filter(d => d.status === 'normal').length },
    { type: '警告', value: deviceData.filter(d => d.status === 'warning').length },
    { type: '故障', value: deviceData.filter(d => d.status === 'error').length },
  ];

  // 设备数量数据
  const deviceCountData = deviceData.map(device => ({
    name: device.name,
    total: device.total,
    running: device.running,
  }));

  return (
    <div className={styles.container}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 0 }}>设备监控看板</Title>
        <Title level={4} type="secondary">
          {currentTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
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
                type: 'spider',
                content: '{name}: {percentage}',
              }}
              color={['#52c41a', '#faad14', '#ff4d4f']}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="设备数量统计">
            <Column
              data={deviceCountData}
              xField="name"
              yField="total"
              seriesField="name"
              isGroup={true}
              columnStyle={{ radius: [4, 4, 0, 0] }}
              label={{
                position: 'middle',
                style: { fill: '#fff' },
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {deviceData.map((device, index) => (
          <Col span={8} key={index} style={{ marginBottom: 16 }}>
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
                  status={device.status === 'error' ? 'exception' : 'normal'}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;
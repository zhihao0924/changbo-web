import React, { useCallback, useRef, useState } from 'react'
import { Button, Modal, Form, Input } from 'antd'
import Services from '@/pages/device/services'
import { type ActionType, PageContainer, ProTable } from '@ant-design/pro-components'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'

type Columns = API_PostDeviceList.List

const DeviceTypes: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const [form] = Form.useForm()
  const [visible, setVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<Columns | null>(null)

  const getDeviceTypes = useCallback(async () => {
    const res = await Services.api.postDeviceTypes({})
    console.log('API Response:', res) // 调试日志

    if (res) {
      return Promise.resolve({
        total: res.res.list.length,
        data: res.res.list || [],
        success: true
      })
    }
    return {}
  }, [])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (currentRecord) {
        await Services.api.updateDeviceTypes({ ...currentRecord, ...values })
      } else {
        await Services.api.postDeviceTypes(values)
      }
      setVisible(false)
      form.resetFields()
      actionRef.current?.reload()
    } catch (error) {
      console.error('操作失败:', error)
    }
  }

  const columns = [
    {
      title: '设备类型',
      dataIndex: 'key',
      key: 'key',
      hideInSearch: true
    },
    {
      title: '类型名称',
      dataIndex: 'value',
      key: 'value',
      hideInSearch: true
    },
    {
      title: '操作',
      key: 'action',
      hideInSearch: true,
      render: (_: any, record: React.SetStateAction<API_PostDeviceList.List | null>) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setCurrentRecord(record)
            form.setFieldsValue(record)
            setVisible(true)
          }}
        >
          修改
        </Button>
      )
    }
  ]

  return (
    <div>
      <PageContainer content="">
        <div>
          <ProTable<Columns, Columns>
            sticky={{
              offsetHeader: 48
            }}
            actionRef={actionRef}
            formRef={formRef}
            form={{
              preserve: false
            }}
            bordered={true}
            scroll={{ x: '100%' }}
            headerTitle=""
            search={{
              defaultCollapsed: false,
              labelWidth: 100,
              optionRender: (searchConfig, formProps, dom) => {
                return [...dom]
              }
            }}
            toolBarRender={() => [
              <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => {
                form.resetFields()
                setVisible(true)
              }}>
                添加设备类型
              </Button>
            ]}
            pagination={{ size: 'default' }}
            columns={columns}
            request={() => getDeviceTypes()}
          />
        </div>
      </PageContainer>

      <Modal
        title={currentRecord ? '修改设备类型' : '添加设备类型'}
        open={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item hidden={true} name="id" label="设备类型"
                     rules={[{ required: true, message: '请输入设备类型名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="key" label="设备类型" rules={[{ required: true, message: '请输入设备类型名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="value" label="类型名称" rules={[{ required: true, message: '请输入类型名称' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}


export default DeviceTypes

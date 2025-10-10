import {
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons"
import type { ActionType, ProColumns } from "@ant-design/pro-components"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import { Button, Form, Input, message, Modal, Select, Switch } from "antd"
import React, { useCallback, useMemo, useRef, useState } from "react"
import Services from "@/pages/device/services"

type Columns = API_PostDeviceList.List

type CreateFormValues = {
  id: number
  name: string
  ip: string
  position: string
  type: string
  is_maintaining: boolean
}

const DeviceIndex: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const [modalVisible, setModalVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [currentDevice, setCurrentDevice] = useState<Columns | null>(null)
  const [form] = Form.useForm<CreateFormValues>()

  const [deviceTypes, setDeviceTypes] = useState<API_PostDeviceTypes.List[]>([])

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
      return Promise.resolve({
        total: res.res.total,
        data: res.res.list || [],
        success: true,
      })
    }
    return {}
  }, [])

  const openModal = useCallback(
    (record: Columns | null = null) => {
      setCurrentDevice(record)
      if (record) {
        form.setFieldsValue({
          id: record.id,
          name: record.name,
          ip: record.ip,
          position: record.position,
          type: record.type,
          is_maintaining: record.is_maintaining,
        })
      } else {
        form.resetFields()
      }
      setModalVisible(true)
    },
    [form],
  )

  const handleCancel = useCallback(() => {
    setModalVisible(false)
    form.resetFields()
  }, [form])

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      setSubmitLoading(true)
      const res = await Services.api.postDeviceSave(values)
      message.success(res?.msg || (currentDevice ? "更新设备成功" : "新增设备成功"))
      setModalVisible(false)
      form.resetFields()
      actionRef.current?.reload()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      console.error(error)
      return
    } finally {
      setSubmitLoading(false)
    }
  }, [actionRef, currentDevice, form])

  const handleToggleMaintaining = useCallback(async (record: Columns) => {
    try {
      const data = {
        id: record.id,
        is_maintaining: !record.is_maintaining,
      }
      const res = await Services.api.postToggleMaintaining(data)
      message.success(res?.msg || "更新设备成功")
      actionRef.current?.reload()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      console.error(error)
      return
    }
  }, [])

  const columns: ProColumns<Columns>[] = useMemo(() => {
    return [
      {
        title: "IP地址",
        align: "center",
        dataIndex: "ip",
        search: {
          transform: (value) => ({
            order_no: value,
          }),
        },
      },
      {
        key: "name",
        title: "设备名称",
        align: "center",
        dataIndex: "name",
        hideInSearch: true,
      },
      {
        title: "设备类型",
        align: "center",
        dataIndex: "type",
        valueType: "select",
        request: getDeviceTypes,
        render: (_, record) => {
          const findItem = deviceTypes.find((val) => val.key == record.type)
          return findItem?.value
        },
      },
      {
        title: "安装位置",
        align: "center",
        dataIndex: "position",
        hideInSearch: true,
      },
      {
        title: "设备状态",
        align: "center",
        dataIndex: "status_text",
        hideInSearch: true,
      },
      {
        width: 160,
        title: "操作",
        align: "center",
        valueType: "option",
        render: (_, record) => [
          <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => openModal(record)}>
            修改
          </Button>,
          <Button
            key="toggle"
            type="link"
            icon={record.is_maintaining ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
            onClick={() => handleToggleMaintaining(record)}
          >
            {record.is_maintaining ? "启用" : "停用"}
          </Button>,
        ],
      },
    ]
  }, [deviceTypes, getDeviceTypes, handleToggleMaintaining, openModal])

  return (
    <PageContainer>
      <ProTable<Columns>
        actionRef={actionRef}
        formRef={formRef}
        columns={columns}
        request={getLists}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 80,
        }}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => openModal()}>
            添加设备
          </Button>,
        ]}
      />

      <Modal
        title={currentDevice ? "修改设备" : "添加设备"}
        open={modalVisible}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="设备名称"
            rules={[{ required: true, message: "请输入设备名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ip"
            label="IP地址"
            rules={[
              { required: true, message: "请输入IP地址" },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: "请输入有效的IP地址",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="position"
            label="安装位置"
            rules={[{ required: true, message: "请输入安装位置" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="设备类型"
            rules={[{ required: true, message: "请选择设备类型" }]}
          >
            <Select options={deviceTypes.map((item) => ({ label: item.value, value: item.key }))} />
          </Form.Item>
          <Form.Item name="is_maintaining" label="是否停用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}

export default DeviceIndex

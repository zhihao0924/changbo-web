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
import styles from "./index.less"

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
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
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

  const openCreateModal = useCallback(() => {
    form.resetFields()
    setCreateModalVisible(true)
  }, [form, setCreateModalVisible])

  const handleCancel = useCallback(() => {
    setCreateModalVisible(false)
    setEditModalVisible(false)
    form.resetFields()
  }, [form, setCreateModalVisible, setEditModalVisible])

  const handleEdit = useCallback(
    (record: Columns) => {
      setCurrentDevice(record)
      form.setFieldsValue({
        id: record.id,
        name: record.name,
        ip: record.ip,
        position: record.position,
        type: record.type,
        is_maintaining: record.is_maintaining,
      })
      setEditModalVisible(true)
    },
    [form],
  )

  const handleCreateSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      setSubmitLoading(true)
      const res = await Services.api.postDeviceCreate(values)
      message.success(res?.msg || "新增设备成功")
      setCreateModalVisible(false)
      form.resetFields()
      actionRef.current?.reload()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      console.error(error)
      // message.error(error?.msg || "新增设备失败")
      return
    } finally {
      setSubmitLoading(false)
    }
  }, [actionRef, form, setCreateModalVisible, setSubmitLoading])

  const handleUpdateSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      setSubmitLoading(true)
      const res = await Services.api.postDeviceUpdate(values)
      message.success(res?.msg || "更新设备成功")
      setCreateModalVisible(false)
      form.resetFields()
      actionRef.current?.reload()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      console.error(error)
      // message.error(error?.msg  || "更新设备失败")
      return
    } finally {
      setEditModalVisible(false)
    }
  }, [actionRef, form, setEditModalVisible, setSubmitLoading])

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
    } finally {
      setEditModalVisible(false)
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
        dataIndex: "option",
        valueType: "option",
        hideInDescriptions: true,
        hideInSearch: true,
        fixed: "right",
        render: (_, row) => {
          return [
            <div key="operation" className={styles.operationBtn}>
              <a onClick={() => handleEdit(row)}>
                <EditOutlined /> 修改设备
              </a>

              {row.is_maintaining ? (
                <a onClick={() => handleToggleMaintaining(row)}>
                  <PlayCircleOutlined /> 恢复使用
                </a>
              ) : (
                <a onClick={() => handleToggleMaintaining(row)}>
                  <PauseCircleOutlined /> 暂停使用
                </a>
              )}
            </div>,
          ]
        },
      },
    ]
  }, [deviceTypes, getDeviceTypes, handleEdit, handleToggleMaintaining])

  return (
    <>
      <PageContainer content="">
        <div className={styles.purchase_container}>
          <ProTable<Columns, Columns>
            sticky={{
              offsetHeader: 48,
            }}
            actionRef={actionRef}
            formRef={formRef}
            form={{
              preserve: false,
            }}
            bordered={true}
            scroll={{ x: "100%" }}
            headerTitle="设备列表"
            search={{
              defaultCollapsed: false,
              labelWidth: 100,
              optionRender: (searchConfig, formProps, dom) => {
                return [...dom]
              },
            }}
            toolBarRender={() => [
              <Button key="create" type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                添加设备
              </Button>,
            ]}
            pagination={{ size: "default" }}
            columns={columns}
            request={(params) => getLists(params)}
          />
        </div>
      </PageContainer>

      <Modal
        title="添加设备"
        open={createModalVisible}
        onCancel={handleCancel}
        onOk={handleCreateSubmit}
        destroyOnClose
        maskClosable={false}
        confirmLoading={submitLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="设备名称"
            rules={[{ required: true, message: "请输入设备名称" }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item name="ip" label="IP地址" rules={[{ required: true, message: "请输入IP地址" }]}>
            <Input placeholder="请输入IP地址" />
          </Form.Item>
          <Form.Item name="position" label="安装位置">
            <Input placeholder="请输入安装位置" />
          </Form.Item>
          <Form.Item
            name="type"
            label="设备类型"
            rules={[{ required: true, message: "请选择设备类型" }]}
          >
            <Select
              placeholder="请选择设备类型"
              options={deviceTypes.map((item) => ({ label: item.value, value: item.key }))}
            />
          </Form.Item>
          <Form.Item name="is_maintaining" label="是否维护" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="修改设备"
        open={editModalVisible}
        onCancel={handleCancel}
        onOk={handleUpdateSubmit}
        destroyOnClose
        maskClosable={false}
        confirmLoading={submitLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="设备ID"
            rules={[{ required: true, message: "请输入设备名称" }]}
            hidden={true}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item
            name="name"
            label="设备名称"
            rules={[{ required: true, message: "请输入设备名称" }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item name="ip" label="IP地址" rules={[{ required: true, message: "请输入IP地址" }]}>
            <Input placeholder="请输入IP地址" />
          </Form.Item>
          <Form.Item name="position" label="安装位置">
            <Input placeholder="请输入安装位置" />
          </Form.Item>
          <Form.Item
            name="type"
            label="设备类型"
            rules={[{ required: true, message: "请选择设备类型" }]}
          >
            <Select
              placeholder="请选择设备类型"
              options={deviceTypes.map((item) => ({ label: item.value, value: item.key }))}
            />
          </Form.Item>
          <Form.Item name="is_maintaining" label="是否维护" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default DeviceIndex

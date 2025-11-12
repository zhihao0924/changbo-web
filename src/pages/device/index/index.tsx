import {
  DeleteOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SettingOutlined,
  SyncOutlined,
} from "@ant-design/icons"
import type { ActionType, ProColumns } from "@ant-design/pro-components"
import { PageContainer, ProTable } from "@ant-design/pro-components"
import { Button, Form, Input, InputNumber, message, Modal, Select, Space, Switch } from "antd"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Services from "@/pages/device/services"
import type { API_PostDeviceList } from "@/pages/device/services/typings/device"

type Columns = API_PostDeviceList.List

type CreateFormValues = {
  id: number
  name: string
  ip: string
  position: string
  device_type_id: number
  is_maintaining: boolean
}

type CreateSettingFormValues = {
  uplink_power: number | null
  uplink_attenuation: number | null
  downlink_power: number | null
  downlink_attenuation: number | null
}

type DeviceTypeOption = {
  value: number
  label: string
  group: string
}

// 设备类型组常量
const DEVICE_GROUPS = [
  { label: "发射合路器", value: "发射合路器" },
  { label: "接收分路器", value: "接收分路器" },
  { label: "带通双工器", value: "带通双工器" },
  { label: "上行信号剥离器", value: "上行信号剥离器" },
  { label: "下行信号剥离器", value: "下行信号剥离器" },
  { label: "数字近端机", value: "数字近端机" },
  { label: "数字远端机", value: "数字远端机" },
  { label: "模拟近端机", value: "模拟近端机" },
  { label: "模拟远端机", value: "模拟远端机" },
  { label: "干线放大器", value: "干线放大器" },
]

// 配置类型映射
const CONFIG_TYPE_MAP = {
  uplink_power: "上行功率",
  uplink_attenuation: "上行衰减",
  downlink_power: "下行功率",
  downlink_attenuation: "下行衰减",
} as const

// 需要显示设置按钮的设备类型
const SETTING_DEVICE_TYPES = ["数字远端机", "模拟远端机", "干线放大器"] as const

const DeviceIndex: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const [modalVisible, setModalVisible] = useState(false)
  const [settingModalVisible, setSettingModalVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [currentDevice, setCurrentDevice] = useState<Columns | null>(null)
  const [form] = Form.useForm<CreateFormValues>()
  const [rfConfigForm] = Form.useForm<CreateSettingFormValues>()

  const [allDeviceTypes, setAllDeviceTypes] = useState<DeviceTypeOption[]>([])
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeOption[]>([])

  // 初始化设备类型数据
  useEffect(() => {
    const initDeviceTypes = async () => {
      try {
        const res = await Services.api.postDeviceTypes({})
        if (res?.res?.list) {
          const formattedTypes = res.res.list.map((item) => ({
            value: item.id,
            label: item.device_type,
            group: item.device_type_group,
          }))
          setAllDeviceTypes(formattedTypes)
        }
      } catch (error) {
        console.error("获取设备类型失败:", error)
      }
    }
    initDeviceTypes()
  }, [])

  const getDeviceTypes = useCallback(async () => {
    return allDeviceTypes
  }, [allDeviceTypes])

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
        setDeviceTypes(allDeviceTypes.filter((item) => item.group == record.device_type_group))
        form.setFieldsValue({
          ...record,
        })
      } else {
        form.resetFields()
      }
      setModalVisible(true)
    },
    [form, allDeviceTypes],
  )

  const openSettingModal = useCallback(
    (record: Columns | null = null) => {
      console.log("打开设置模态框，设备ID:", record?.id)
      setCurrentDevice(record)

      // 先打开模态框，确保表单已经挂载
      setSettingModalVisible(true)

      // 然后获取数据并设置表单值
      Services.api
        .postRFConfig({
          device_id: record?.id,
        })
        .then((res) => {
          console.log("API返回数据:", res)
          console.log("配置数据:", {
            uplink_power: res.res.uplink_power,
            uplink_attenuation: res.res.uplink_attenuation,
            downlink_power: res.res.downlink_power,
            downlink_attenuation: res.res.downlink_attenuation,
          })

          // 使用setTimeout确保表单已经挂载完成
          setTimeout(() => {
            rfConfigForm.setFieldsValue({
              uplink_power: res.res.uplink_power,
              uplink_attenuation: res.res.uplink_attenuation,
              downlink_power: res.res.downlink_power,
              downlink_attenuation: res.res.downlink_attenuation,
            })

            // 验证表单字段是否设置成功
            const fields = rfConfigForm.getFieldsValue()
            console.log("表单字段值:", fields)
          }, 100)
        })
        .catch((error) => {
          console.error("获取设备配置失败:", error)
          message.error("获取设备配置失败，请稍后重试")
        })
    },
    [rfConfigForm],
  )

  const syncPanel = useCallback(async () => {
    try {
      const res = await Services.api.postDeviceSyncPanel({}).then((res) => {
        message.success(
          `同步面板信息成功${res.res.success_count}条，失败${res.res.fail_count}条`,
          2,
          actionRef.current?.reload,
        )
      })

      return res
    } catch (error) {
      console.error("同步面板失败:", error)
      message.error("同步面板失败")
      throw error
    } finally {
    }
  }, [])

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
    } finally {
      setSubmitLoading(false)
    }
  }, [actionRef, currentDevice, form])

  const handleToggleMaintaining = useCallback(async (record: Columns) => {
    try {
      const data = {
        id: record.id,
        is_maintaining: !record?.is_maintaining,
      }
      const res = await Services.api.postToggleMaintaining(data)
      message.success(res?.msg || "更新设备成功")
      actionRef.current?.reload()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      console.error(error)
    }
  }, [])

  // 配置类型对应的中文标签
  const getConfigLabel = useCallback((configType: string): string => {
    return CONFIG_TYPE_MAP[configType as keyof typeof CONFIG_TYPE_MAP] || configType
  }, [])

  // 统一的参数配置保存函数
  const saveRFConfig = useCallback(
    async (configType: string) => {
      if (!currentDevice?.id) {
        message.error("设备信息异常，无法保存配置")
        return
      }

      const fieldValue = rfConfigForm.getFieldValue(configType)
      if (fieldValue === undefined || fieldValue === null) {
        message.error(`请输入${getConfigLabel(configType)}`)
        return
      }

      try {
        const res = await Services.api.postRFConfigSave({
          device_id: currentDevice.id,
          current_val: Number(fieldValue),
          rf_config_type: configType,
        })
        message.success(res?.msg || `${getConfigLabel(configType)}保存成功`)
      } catch (error) {
        console.error(`${configType}保存失败:`, error)
        message.error(`${getConfigLabel(configType)}保存失败`)
      }
    },
    [currentDevice, getConfigLabel, rfConfigForm],
  )

  const columns: ProColumns<Columns>[] = useMemo(() => {
    return [
      {
        title: "IP地址",
        align: "center",
        dataIndex: "ip",
        fixed: "left",
        key: "ip",
        search: {
          transform: (value) => ({
            order_no: value,
          }),
        },
      },
      {
        key: "name",
        title: "设备编号",
        align: "center",
        dataIndex: "name",
        hideInSearch: true,
        width: 200,
      },
      {
        key: "device_type_group",
        title: "设备名称",
        align: "center",
        dataIndex: "device_type_group",
        hideInSearch: true,
        width: 200,
      },
      {
        title: "设备类型",
        align: "center",
        dataIndex: "device_type_id",
        key: "device_type_id",
        valueType: "select",
        request: getDeviceTypes,
        fieldProps: {
          showSearch: true,
        },
        width: 200,
      },
      {
        title: "安装位置",
        align: "center",
        dataIndex: "position",
        key: "position",
        hideInSearch: true,
        width: 200,
      },
      {
        title: "设备状态",
        align: "center",
        dataIndex: "status_text",
        key: "status_text",
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_panel_type",
        title: "设备类型",
        align: "center",
        dataIndex: ["panel_info", "panel_type"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_panel_id",
        title: "ID号",
        align: "center",
        dataIndex: ["panel_info", "panel_id"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_name",
        title: "名称",
        align: "center",
        dataIndex: ["panel_info", "name"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_model",
        title: "型号",
        align: "center",
        dataIndex: ["panel_info", "model"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_serial_number",
        title: "编码",
        align: "center",
        dataIndex: ["panel_info", "serial_number"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_area",
        title: "区域",
        align: "center",
        dataIndex: ["panel_info", "area"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_sn",
        title: "序列号",
        align: "center",
        dataIndex: ["panel_info", "sn"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_physical_sn",
        title: "物理序列号",
        align: "center",
        dataIndex: ["panel_info", "physical_sn"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_firmware_id",
        title: "固件ID",
        align: "center",
        dataIndex: ["panel_info", "firmware_id"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_upstream_band",
        title: "上行频段",
        align: "center",
        dataIndex: ["panel_info", "upstream_band"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_downstream_band",
        title: "下行频段",
        align: "center",
        dataIndex: ["panel_info", "downstream_band"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_band_code",
        title: "频段代码",
        align: "center",
        dataIndex: ["panel_info", "band_code"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_power",
        title: "功率（W）",
        align: "center",
        dataIndex: ["panel_info", "power"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_firmware_type",
        title: "固件类型",
        align: "center",
        dataIndex: ["panel_info", "firmware_type"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_firmware_version",
        title: "固件版本",
        align: "center",
        dataIndex: ["panel_info", "firmware_version"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_internal_version",
        title: "内码版本",
        align: "center",
        dataIndex: ["panel_info", "internal_version"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_bootloader_version",
        title: "引导程序版本",
        align: "center",
        dataIndex: ["panel_info", "bootloader_version"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_netmask",
        title: "网络掩码",
        align: "center",
        dataIndex: ["panel_info", "netmask"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_wifi_mac",
        title: "WiFi MAC地址",
        align: "center",
        dataIndex: ["panel_info", "wifi_mac"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_ipv4",
        title: "IPV4地址",
        align: "center",
        dataIndex: ["panel_info", "ipv4"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_ipv6",
        title: "IPV6地址",
        align: "center",
        dataIndex: ["panel_info", "ipv6"],
        hideInSearch: true,
        width: 200,
      },
      {
        key: "panel_info_last_program_time",
        title: "上次编码时间",
        align: "center",
        dataIndex: ["panel_info", "last_program_time"],
        hideInSearch: true,
        width: 200,
      },
      {
        width: 240,
        title: "操作",
        align: "center",
        valueType: "option",
        fixed: "right",
        render: (_, record) => {
          // 需要显示设置按钮的设备类型组
          const showSettingButton = SETTING_DEVICE_TYPES.includes(
            record.device_type_group as (typeof SETTING_DEVICE_TYPES)[number],
          )

          return [
            <div key="actions">
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() => openModal(record)}
              >
                修改
              </Button>
              <Button
                key="delete"
                type="link"
                icon={<DeleteOutlined />}
                onClick={() =>
                  Modal.confirm({
                    title: `确认删除设备${record.name}吗？`,
                    onOk: () => {
                      Modal.info({ title: `确认删除设备${record.name}成功` })
                    },
                  })
                }
              >
                删除
              </Button>
              <Button
                key="toggle"
                type="link"
                icon={record?.is_maintaining ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                onClick={() => handleToggleMaintaining(record)}
              >
                {record?.is_maintaining ? "维护结束" : "开始维护"}
              </Button>
              {showSettingButton && (
                <Button
                  key="setting"
                  type="link"
                  icon={<SettingOutlined />}
                  onClick={() => openSettingModal(record)}
                >
                  设置
                </Button>
              )}
            </div>,
          ]
        },
      },
    ]
  }, [getDeviceTypes, handleToggleMaintaining, openModal, openSettingModal])

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
          size: "default",
        }}
        search={{
          labelWidth: 80,
        }}
        toolBarRender={() => [
          <Button key="button" icon={<PlusOutlined />} type="primary" onClick={() => openModal()}>
            添加设备
          </Button>,
          <Button key="button" icon={<SyncOutlined />} type="primary" onClick={() => syncPanel()}>
            同步设备信息
          </Button>,
        ]}
        scroll={{ x: 0 }}
        // 列设置配置
        columnsState={{
          // persistenceKey: "deviceIndexColumns", // 本地存储的key
          // persistenceType: "localStorage", // 存储方式
          defaultValue: {
            device_type_group: { show: true },
            device_type_id: { show: true },
            position: { show: true },
            status_text: { show: true },
            panel_info_panel_type: { show: false },
            panel_info_panel_id: { show: false },
            panel_info_name: { show: false },
            panel_info_model: { show: false },
            panel_info_serial_number: { show: false },
            panel_info_area: { show: false },
            panel_info_sn: { show: false },
            panel_info_physical_sn: { show: false },
            panel_info_firmware_id: { show: false },
            panel_info_upstream_band: { show: false },
            panel_info_downstream_band: { show: false },
            panel_info_band_code: { show: false },
            panel_info_power: { show: false },
            panel_info_firmware_type: { show: false },
            panel_info_firmware_version: { show: false },
            panel_info_internal_version: { show: false },
            panel_info_bootloader_version: { show: false },
            panel_info_netmask: { show: false },
            panel_info_wifi_mac: { show: false },
            panel_info_ipv4: { show: false },
            panel_info_ipv6: { show: false },
            panel_info_last_program_time: { show: false },
          },
        }}
      />

      <Modal
        title={currentDevice ? "修改设备" : "添加设备"}
        open={modalVisible}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        onCancel={handleCancel}
      >
        <Form form={form}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="设备编号"
            rules={[{ required: true, message: "请输入设备编号" }]}
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
            <Input
              onChange={(e) => {
                const ip = e.target.value
                if (
                  /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(ip)
                ) {
                  const ipParts = ip.split(".")
                  form.setFieldsValue({ name: ipParts[3] })
                }
              }}
            />
          </Form.Item>
          <Form.Item
            name="position"
            label="安装位置"
            rules={[{ required: true, message: "请输入安装位置" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="device_type_group"
            label="设备名称"
            rules={[{ required: true, message: "请选择设备名称" }]}
          >
            <Select
              options={DEVICE_GROUPS}
              onChange={(item) => {
                form.setFieldValue("device_type_id", undefined)
                setDeviceTypes(allDeviceTypes.filter((types) => types.group == item))
              }}
            />
          </Form.Item>
          <Form.Item
            name="device_type_id"
            label="设备类型"
            rules={[{ required: true, message: "请选择设备类型" }]}
          >
            <Select options={deviceTypes} />
          </Form.Item>
          <Form.Item name="is_maintaining" label="维护状态" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="is_online" label="在线状态" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={"设备设置"}
        onCancel={() => {
          setSettingModalVisible(false)
          rfConfigForm.resetFields()
        }}
        open={settingModalVisible}
        footer={null}
      >
        <Form form={rfConfigForm}>
          <Form.Item label="上行功率">
            <Space align="center">
              <Form.Item name="uplink_power" noStyle>
                <InputNumber placeholder="请输入上行功率" />
              </Form.Item>
              <Button type="link" onClick={() => saveRFConfig("uplink_power")}>
                保存
              </Button>
            </Space>
          </Form.Item>
          <Form.Item label="上行衰减">
            <Space align="center">
              <Form.Item name="uplink_attenuation" noStyle>
                <InputNumber min={0} max={100} placeholder="请输入上行衰减" />
              </Form.Item>
              <Button type="link" onClick={() => saveRFConfig("uplink_attenuation")}>
                保存
              </Button>
            </Space>
          </Form.Item>
          <Form.Item label="下行功率">
            <Space align="center">
              <Form.Item name="downlink_power" noStyle>
                <InputNumber min={0} max={100} placeholder="请输入下行功率" />
              </Form.Item>
              <Button type="link" onClick={() => saveRFConfig("downlink_power")}>
                保存
              </Button>
            </Space>
          </Form.Item>
          <Form.Item label="下行衰减">
            <Space align="center">
              <Form.Item name="downlink_attenuation" noStyle>
                <InputNumber placeholder="请输入下行衰减" />
              </Form.Item>
              <Button type="link" onClick={() => saveRFConfig("downlink_attenuation")}>
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}

export default DeviceIndex

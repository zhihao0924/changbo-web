import React, { useCallback, useRef, useState } from "react"
import { Button, Modal, Form, Input, message, Space, InputNumber } from "antd"
import Services from "@/pages/device/services"
import { type ActionType, PageContainer, ProTable } from "@ant-design/pro-components"
import { forEach } from "lodash"
import { EditOutlined, SettingOutlined } from "@ant-design/icons"

type Columns = API_PostDeviceList.List

const DeviceTypes: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const [nameForm] = Form.useForm()
  const [nameModalVisible, setNameModalVisible] = useState(false)
  const [configForm] = Form.useForm()
  const [configModalVisible, setConfigNameModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<Columns | null>(null)

  const getDeviceTypes = useCallback(async () => {
    const res = await Services.api.postDeviceTypes({})
    console.log("API Response:", res) // 调试日志

    if (res) {
      return Promise.resolve({
        total: res.res.list.length,
        data: res.res.list || [],
        success: true,
      })
    }
    return {}
  }, [])

  const handleNameSubmit = async () => {
    try {
      const values = await nameForm.validateFields()
      const res = await Services.api.postDeviceTypeSave({
        ...currentRecord,
        type: values.key,
        show_type: values.value,
      })
      message.success(
        res?.msg || (currentRecord ? "更新设备类型成功" : "新增设备类型成功"),
        1,
        () => {
          setNameModalVisible(false)
          nameForm.resetFields()
          actionRef.current?.reload()
        },
      )
    } catch (error) {
      console.error("操作失败:", error)
    }
  }

  const handleConfigSubmit = async () => {
    try {
      const values = await configForm.validateFields()

      const configs: { config_type: number; min_value: number; max_value: number }[] = []
      forEach(values.configs, (item, key) => {
        if (!item.min && !item.max) return
        configs.push({
          config_type: parseInt(key),
          min_value: item.min,
          max_value: item.max,
        })
      })
      await Services.api.postDeviceTypeConfigSave({
        type: currentRecord?.key,
        configs: configs,
      })
      message.success("保存成功", 1, () => {
        setConfigNameModalVisible(false)
        configForm.resetFields()
        actionRef.current?.reload()
      })
    } catch (error) {
      console.error("操作失败:", error)
    }
  }

  const columns = [
    {
      title: "设备类型",
      dataIndex: "key",
      key: "key",
      hideInSearch: true,
    },
    {
      title: "类型名称",
      dataIndex: "value",
      key: "value",
      hideInSearch: true,
    },
    {
      title: "操作",
      key: "action",
      hideInSearch: true,
      render: (_: any, record: React.SetStateAction<API_PostDeviceList.List | null>) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentRecord(record)
              nameForm.setFieldsValue(record)
              setNameModalVisible(true)
            }}
          >
            展示名称
          </Button>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => {
              setCurrentRecord(record)
              forEach(record?.configs, (item) => {
                if (item.min_value != undefined) {
                  configForm.setFieldValue(
                    ["configs", `${item.config_type}`, "min"],
                    item.min_value,
                  )
                }
                if (item.max_value != undefined) {
                  configForm.setFieldValue(
                    ["configs", `${item.config_type}`, "max"],
                    item.max_value,
                  )
                }
              })
              setConfigNameModalVisible(true)
            }}
          >
            阈值设置
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageContainer content="">
        <div>
          <ProTable<Columns, Columns>
            search={false}
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
            headerTitle=""
            toolBarRender={() => [
              // <Button
              //   key="create"
              //   type="primary"
              //   icon={<PlusOutlined />}
              //   onClick={() => {
              //     setCurrentRecord(null)
              //     form.resetFields()
              //     setVisible(true)
              //   }}
              // >
              //   添加设备类型
              // </Button>,
            ]}
            pagination={{ size: "default" }}
            columns={columns}
            request={() => getDeviceTypes()}
          />
        </div>
      </PageContainer>

      <Modal
        title={currentRecord ? "修改设备类型" : "添加设备类型"}
        open={nameModalVisible}
        onOk={handleNameSubmit}
        onCancel={() => setNameModalVisible(false)}
      >
        <Form form={nameForm} layout="vertical">
          <Form.Item hidden={true} name="id" label="设备类型ID">
            <Input />
          </Form.Item>
          <Form.Item
            name="key"
            label="设备类型"
            hidden={true}
            rules={[{ required: true, message: "请输入设备类型名称" }]}
          >
            <Input readOnly={true} />
          </Form.Item>
          <Form.Item
            name="value"
            label="展示名称"
            rules={[{ required: true, message: "请输入展示名称" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${currentRecord?.value || currentRecord?.key}-阈值设置`}
        open={configModalVisible}
        onOk={handleConfigSubmit}
        onCancel={() => setConfigNameModalVisible(false)}
      >
        <Form form={configForm} layout="vertical">
          {currentRecord?.configs?.map((item) => {
            return (
              <Form.Item label={item.config_type_name}>
                <Space>
                  <Form.Item
                    name={["configs", `${item.config_type}`, "min"]}
                    initialValue={item.min_value ?? undefined}
                    rules={[
                      {
                        validator: (_, value) => {
                          const maxValue = configForm.getFieldValue([
                            "configs",
                            item.config_type,
                            "max",
                          ])
                          if (value !== undefined && maxValue !== undefined && value >= maxValue) {
                            return Promise.reject(`最小值必须小于最大值`)
                          }
                          return Promise.resolve()
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      step={0.1}
                      precision={1}
                      addonBefore="最小"
                      addonAfter={item.unit}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    name={["configs", `${item.config_type}`, "max"]}
                    initialValue={item.max_value ?? undefined}
                    rules={[
                      {
                        validator: (_, value) => {
                          const minValue = configForm.getFieldValue([
                            "configs",
                            item.config_type,
                            "min",
                          ])
                          if (value !== undefined && minValue !== undefined && value <= minValue) {
                            return Promise.reject(`最大值必须大于最小值`)
                          }
                          return Promise.resolve()
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      step={0.1}
                      precision={1}
                      addonBefore="最大"
                      addonAfter={item.unit}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Space>
              </Form.Item>
            )
          })}
        </Form>
      </Modal>
    </div>
  )
}

export default DeviceTypes

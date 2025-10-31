import React, { useCallback, useRef, useState } from "react"
import { Button, Modal, Form, Input, message, Space, InputNumber, Checkbox, Row, Col } from "antd"
import Services from "@/pages/device/services"
import { type ActionType, PageContainer, ProTable } from "@ant-design/pro-components"
import { forEach } from "lodash"

type Columns = API_PostDeviceTypes.List

const DeviceTypes: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const [nameForm] = Form.useForm()
  const [nameModalVisible, setNameModalVisible] = useState(false)
  const [configForm] = Form.useForm()
  const [configModalVisible, setConfigModalVisible] = useState(false)
  const [alarmForm] = Form.useForm()
  const [alarmModalVisible, setAlarmModalVisible] = useState(false)
  const [showForm] = Form.useForm()
  const [showModalVisible, setShowModalVisible] = useState(false)
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
        device_type: values.device_type,
        device_type_alias: values.device_type_alias,
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

      const configs: { config_type: number; val: number }[] = []
      forEach(values.configs, (item, key) => {
        if (!item.alarm_min && !item.alarm_max && !item.show_min && !item.show_max) return
        configs.push({
          config_type: parseInt(key),
          ...item,
        })
      })
      await Services.api
        .postDeviceTypeConfigSave({
          device_type_id: currentRecord?.id,
          configs: configs,
        })
        .then(() => {
          message.success("保存成功", 1, () => {
            setConfigModalVisible(false)
            configForm.resetFields()
            actionRef.current?.reload()
          })
        })
    } catch (error) {
      console.error("操作失败:", error)
    }
  }

  const handleAlarmSubmit = async () => {
    try {
      const values = await alarmForm.validateFields()
      await Services.api
        .postDeviceTypeAlarmSave({
          device_type_id: currentRecord?.id,
          alarms: values.alarms,
        })
        .then(() => {
          message.success(`${currentRecord?.device_type} 告警配置保存成功`, 1, () => {
            setAlarmModalVisible(false)
            alarmForm.resetFields()
            actionRef.current?.reload()
          })
          return {}
        })
    } catch (error) {
      console.error("操作失败:", error)
    }
  }
  const handleShowSubmit = async () => {
    try {
      const values = await showForm.validateFields()
      await Services.api
        .postDeviceTypeShowSave({
          device_type_id: currentRecord?.id,
          show_in_list: values.show_in_list,
          show_in_detail: values.show_in_detail,
        })
        .then(() => {
          message.success(`${currentRecord?.device_type} 展示配置保存成功`, 1, () => {
            setShowModalVisible(false)
            showForm.resetFields()
            actionRef.current?.reload()
          })
          return {}
        })
    } catch (error) {
      console.error("操作失败:", error)
    }
  }

  const columns = [
    {
      title: "设备名称",
      dataIndex: "device_type_group",
      key: "device_type_group",
      hideInSearch: true,
    },
    {
      title: "设备类型",
      dataIndex: "device_type",
      key: "device_type",
      hideInSearch: true,
    },
    {
      title: "类型别名",
      dataIndex: "device_type_alias",
      key: "device_type_alias",
      hideInSearch: true,
    },
    {
      title: "操作",
      key: "action",
      hideInSearch: true,
      render: (_: any, record: API_PostDeviceTypes.List) => (
        <Space>
          <Button
            type="link"
            // icon={<SettingOutlined />}
            onClick={() => {
              setCurrentRecord(record)
              nameForm.setFieldsValue(record)
              setNameModalVisible(true)
            }}
          >
            别名
          </Button>
          <Button
            type="link"
            // icon={<SettingOutlined />}
            onClick={() => {
              setCurrentRecord(record)
              forEach(record?.configs, (item) => {
                console.log(item)
                configForm.setFieldValue(["configs", `${item.config_type}`], item)
              })
              setConfigModalVisible(true)
            }}
          >
            阈值
          </Button>
          <Button
            type="link"
            // icon={<SettingOutlined />}
            onClick={() => {
              setCurrentRecord(record)
              const alarms: any[] = []
              forEach(record?.alarms, (item) => {
                if (item.is_selected) {
                  alarms.push(item.config_type)
                }
              })

              alarmForm.setFieldsValue({ alarms: alarms })
              setAlarmModalVisible(true)
            }}
          >
            告警
          </Button>
          <Button
            type="link"
            // icon={<SettingOutlined />}
            onClick={() => {
              setCurrentRecord(record)
              const showListData: any[] = []
              const showDetailData: any[] = []
              forEach(record?.shows, (item) => {
                if (item.is_show_in_list) {
                  showListData.push(item.config_type)
                }
                if (item.is_show_in_detail) {
                  showDetailData.push(item.config_type)
                }
              })
              showForm.setFieldsValue({ show_in_list: showListData })
              showForm.setFieldsValue({ show_in_detail: showDetailData })
              setShowModalVisible(true)
            }}
          >
            展示
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
        <Form form={nameForm}>
          <Form.Item
            name="device_type"
            label="设备类型"
            hidden={true}
            rules={[{ required: true, message: "请输入设备类型名称" }]}
          >
            <Input readOnly={true} />
          </Form.Item>
          <Form.Item name="device_type_alias" label="类型别名" key={"device_type_alias"}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${currentRecord?.device_type_group} ${currentRecord?.device_type} 设置`}
        open={configModalVisible}
        onOk={handleConfigSubmit}
        onCancel={() => setConfigModalVisible(false)}
        width={960}
      >
        <Form form={configForm}>
          <Row>
            {currentRecord?.configs?.map((item) => {
              return (
                <>
                  <Col span={12} key={`${item.config_type}_alarm`}>
                    <Form.Item label={`${item.config_type_name}`} labelCol={{ span: 6 }}>
                      <Space align="center" style={{ display: "flex", alignItems: "center" }}>
                        <Form.Item
                          name={["configs", `${item.config_type}`, "alarm_min"]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const max = getFieldValue([
                                  "configs",
                                  item.config_type,
                                  "alarm_max",
                                ])
                                if (typeof value !== "number" || typeof max !== "number") {
                                  return Promise.resolve()
                                }
                                if (value < max) {
                                  return Promise.resolve()
                                }
                                return Promise.reject(new Error("最小值必须小于最大值"))
                              },
                            }),
                          ]}
                        >
                          <InputNumber
                            step={0.1}
                            addonAfter={item.unit}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                        <Form.Item>至</Form.Item>
                        <Form.Item
                          name={["configs", `${item.config_type}`, "alarm_max"]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const min = getFieldValue([
                                  "configs",
                                  item.config_type,
                                  "alarm_min",
                                ])
                                if (typeof value !== "number" || typeof min !== "number") {
                                  return Promise.resolve()
                                }
                                if (value > min) {
                                  return Promise.resolve()
                                }
                                return Promise.reject(new Error("最大值必须大于最小值"))
                              },
                            }),
                          ]}
                        >
                          <InputNumber
                            step={0.1}
                            addonAfter={item.unit}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Space>{" "}
                    </Form.Item>
                  </Col>
                  <Col span={12} key={`${item.config_type}_range`}>
                    <Form.Item label={`显示范围`} labelCol={{ span: 6 }}>
                      <Space align="center" style={{ display: "flex", alignItems: "center" }}>
                        <Form.Item
                          name={["configs", `${item.config_type}`, "show_min"]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const max = getFieldValue(["configs", item.config_type, "show_max"])
                                if (typeof value !== "number" || typeof max !== "number") {
                                  return Promise.resolve()
                                }
                                if (value < max) {
                                  return Promise.resolve()
                                }
                                return Promise.reject(new Error("最小值必须小于最大值"))
                              },
                            }),
                          ]}
                        >
                          <InputNumber
                            step={0.1}
                            addonAfter={item.unit}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                        <Form.Item>至</Form.Item>
                        <Form.Item
                          name={["configs", `${item.config_type}`, "show_max"]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const min = getFieldValue(["configs", item.config_type, "show_min"])
                                if (typeof value !== "number" || typeof min !== "number") {
                                  return Promise.resolve()
                                }
                                if (value > min) {
                                  return Promise.resolve()
                                }
                                return Promise.reject(new Error("最大值必须大于最小值"))
                              },
                            }),
                          ]}
                        >
                          <InputNumber
                            step={0.1}
                            addonAfter={item.unit}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Space>{" "}
                    </Form.Item>
                  </Col>
                </>
              )
            })}
          </Row>
        </Form>
      </Modal>

      <Modal
        title={`${currentRecord?.device_type_group} ${currentRecord?.device_type} 设置`}
        open={alarmModalVisible}
        onOk={handleAlarmSubmit}
        onCancel={() => setAlarmModalVisible(false)}
      >
        <Form form={alarmForm}>
          <Form.Item name={"alarms"}>
            <Checkbox.Group key="alarms">
              <Row>
                {currentRecord?.alarms?.map((item) => {
                  return (
                    <Col span={8} key={item.config_type}>
                      <Checkbox key={item.config_type} value={item.config_type}>
                        {item.config_type_name}
                      </Checkbox>
                    </Col>
                  )
                })}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${currentRecord?.device_type_group} ${currentRecord?.device_type} 设置`}
        open={showModalVisible}
        onOk={handleShowSubmit}
        onCancel={() => setShowModalVisible(false)}
      >
        <Form form={showForm} layout={"vertical"}>
          <Form.Item name={"show_in_list"} labelCol={{ span: 6 }} label={"列表中展示"}>
            <Checkbox.Group
              key={"show_in_list"}
              onChange={(checkedValues) => {
                const maxSelected = 3
                if (checkedValues.length > maxSelected) {
                  const lastSelected = checkedValues[checkedValues.length - 1]
                  checkedValues = checkedValues.filter((v) => v !== lastSelected)
                  message.warning(`展示项目最多只能选择${maxSelected}个`)
                }
                showForm.setFieldValue("show_in_list", checkedValues)
              }}
            >
              <Row>
                {currentRecord?.shows?.map((item) => {
                  return (
                    <Col span={8} key={item.config_type}>
                      <Checkbox key={item.config_type} value={item.config_type}>
                        {item.config_type_name}
                      </Checkbox>
                    </Col>
                  )
                })}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item name={"show_in_detail"} labelCol={{ span: 6 }} label={"详情中展示"}>
            <Checkbox.Group key={"show_in_detail"}>
              <Row>
                {currentRecord?.shows?.map((item) => {
                  return (
                    <Col span={8} key={item.config_type}>
                      <Checkbox key={item.config_type} value={item.config_type}>
                        {item.config_type_name}
                      </Checkbox>
                    </Col>
                  )
                })}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DeviceTypes

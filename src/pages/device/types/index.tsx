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
  const [alterForm] = Form.useForm()
  const [alterModalVisible, setAlterModalVisible] = useState(false)
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

      const configs: { config_type: number; val: number }[] = []
      forEach(values.configs, (item, key) => {
        if (!item.val) return
        configs.push({
          config_type: parseInt(key),
          val: item.val,
        })
      })
      await Services.api
        .postDeviceTypeConfigSave({
          type: currentRecord?.key,
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

  const handleAlterSubmit = async () => {
    try {
      const values = await alterForm.validateFields()
      await Services.api
        .postDeviceTypeAlterSave({
          type: currentRecord?.key,
          alters: values.alters,
        })
        .then(() => {
          message.success(`${currentRecord?.key} 告警配置保存成功`, 1, () => {
            setAlterModalVisible(false)
            alterForm.resetFields()
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
          type: currentRecord?.key,
          shows: values.shows,
        })
        .then(() => {
          message.success(`${currentRecord?.key} 展示配置保存成功`, 1, () => {
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
      title: "设备类型",
      dataIndex: "key",
      key: "key",
      hideInSearch: true,
    },
    {
      title: "类型别名",
      dataIndex: "value",
      key: "value",
      hideInSearch: true,
    },
    {
      title: "操作",
      key: "action",
      hideInSearch: true,
      render: (_: any, record: API_PostDeviceTypes.List ) => (
        <Space>
          <Button
            type="primary"
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
            type="primary"
            // icon={<SettingOutlined />}
            onClick={() => {
              setCurrentRecord(record)
              forEach(record?.configs, (item) => {
                if (item.val != undefined) {
                  configForm.setFieldValue(["configs", `${item.config_type}`, "val"], item.val)
                }
              })
              setConfigModalVisible(true)
            }}
          >
            阈值
          </Button>
          <Button
            type="primary"
            // icon={<SettingOutlined />}
            onClick={() => {
              setCurrentRecord(record)
              const alterData: any[] = []
              forEach(record?.alters, (item) => {
                if (item.is_selected) {
                  alterData.push(item.config_type)
                }
              })

              alterForm.setFieldsValue({ alters: alterData })
              setAlterModalVisible(true)
            }}
          >
            告警
          </Button>
          <Button
            type="primary"
            // icon={<SettingOutlined />}
            onClick={() => {
              setCurrentRecord(record)
              const showData: any[] = []
              forEach(record?.shows, (item) => {
                if (item.is_selected) {
                  showData.push(item.config_type)
                }
              })
              showForm.setFieldsValue({ shows: showData })
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
          <Form.Item hidden={true} name="id" label="设备类型ID" key="id">
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
            label="类型别名"
            rules={[{ required: true, message: "请输入类型别名" }]}
            key={"value"}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${currentRecord?.value || currentRecord?.key}-阈值设置`}
        open={configModalVisible}
        onOk={handleConfigSubmit}
        onCancel={() => setConfigModalVisible(false)}
      >
        <Form form={configForm}>
          {currentRecord?.configs?.map((item) => {
            return (
              <Form.Item
                name={["configs", `${item.config_type}`, "val"]}
                initialValue={item.val ?? undefined}
                label={item.config_type_name}
                labelCol={{ span: 6 }}
                key={item.config_type}
              >
                <InputNumber
                  step={0.1}
                  addonBefore={`${
                    item.filter_operator === "GT"
                      ? "大于"
                      : item.filter_operator === "LT"
                      ? "小于"
                      : ""
                  }`}
                  addonAfter={item.unit}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            )
          })}
        </Form>
      </Modal>

      <Modal
        title={`${currentRecord?.value || currentRecord?.key}-告警设置`}
        open={alterModalVisible}
        onOk={handleAlterSubmit}
        onCancel={() => setAlterModalVisible(false)}
      >
        <Form form={alterForm}>
          <Form.Item name={"alters"} label={"告警项目"}>
            <Checkbox.Group key="alters">
              <Row>
                {currentRecord?.alters?.map((item) => {
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
        title={`${currentRecord?.value || currentRecord?.key}-展示设置`}
        open={showModalVisible}
        onOk={handleShowSubmit}
        onCancel={() => setShowModalVisible(false)}
      >
        <Form form={showForm}>
          <Form.Item name={"shows"} label={"展示项目"}>
            <Checkbox.Group
              key="shows"
              onChange={(checkedValues) => {
                const maxSelected = 3
                if (checkedValues.length > maxSelected) {
                  const lastSelected = checkedValues[checkedValues.length - 1]
                  checkedValues = checkedValues.filter((v) => v !== lastSelected)
                  message.warning(`展示项目最多只能选择${maxSelected}个`)
                }
                showForm.setFieldValue("shows", checkedValues)
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
        </Form>
      </Modal>
    </div>
  )
}

export default DeviceTypes

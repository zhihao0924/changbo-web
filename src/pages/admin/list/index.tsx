import React, { useCallback, useMemo, useRef, useState } from "react"
import type { ProColumns } from "@ant-design/pro-components"
import { type ActionType, PageContainer, ProTable } from "@ant-design/pro-components"
import { Button, Form, Input, Modal, Radio, Switch } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import Services from "@/pages/admin/services"

type Columns = API_PostAdminList.List

type CreateFormValues = {
  account: number
  name: string
  email: string
  role: string
  password: string
}

const UserIndex: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const [createAdminForm] = Form.useForm<CreateFormValues>()
  const [resetPwdForm] = Form.useForm<CreateFormValues>()
  const [createAdminModalVisible, setCreateAdminModalVisible] = useState(false)
  const [resetPwdModalVisible, setResetPwdModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<API_PostAdminList.List>()

  const openCreateAdminModal = useCallback(
    (record: Columns | null = null) => {
      if (record) {
      } else {
        createAdminForm.resetFields()
      }
      setCreateAdminModalVisible(true)
    },
    [createAdminForm],
  )

  const handleCreateAdminCancel = useCallback(() => {
    setCreateAdminModalVisible(false)
    createAdminForm.resetFields()
  }, [createAdminForm])

  const openResetPwdModal = useCallback(
    (record: Columns | null = null) => {
      if (record) {
        setCurrentRecord(record)
        resetPwdForm.resetFields()
      } else {
        resetPwdForm.resetFields()
      }
      setResetPwdModalVisible(true)
    },
    [resetPwdForm],
  )

  const getLists = useCallback(async (params: any) => {
    const data = {
      page: params.current,
      limit: params.pageSize,
      ...params,
    }
    delete data.current
    delete data.pageSize

    const res = await Services.api.postAdminList(data)

    if (res) {
      return Promise.resolve({
        total: res.res.total,
        data: res.res.list || [],
        success: true,
      })
    }
    return {}
  }, [])

  const getRoles = useCallback(() => {
    const userInfo = JSON.parse(localStorage.getItem("userinfo"))
    return [
      {
        value: "admin",
        label: "超级管理员",
        disabled: userInfo?.account != "admin",
      },
      { value: "user", label: "管理员" },
    ]
  }, [])

  const handleCreateAdminSubmit = useCallback(async () => {
    const values = await createAdminForm.validateFields()
    const res = await Services.api.postAdminCreate(values)
    if (res.err == 0) {
      setCreateAdminModalVisible(false)
      createAdminForm.resetFields()
      actionRef.current?.reload()
    }
  }, [createAdminForm])

  const handleResetPwdSubmit = useCallback(async () => {
    const values = await resetPwdForm.validateFields()
    const res = await Services.api.postAdminResetPwd({
      target_admin_id: currentRecord?.id,
      ...values,
    })
    if (res.err == 0) {
      setResetPwdModalVisible(false)
      resetPwdForm.resetFields()
      actionRef.current?.reload()
    }
  }, [currentRecord, resetPwdForm])

  const handleResetPwdCancel = useCallback(() => {
    setResetPwdModalVisible(false)
    resetPwdForm.resetFields()
  }, [resetPwdForm])

  const handleDisabledAdmin = useCallback((record, e: any) => {
    Modal.confirm({
      title: "确认禁用",
      content: "确认禁用该账号？",
      onOk: async () => {
        await Services.api
          .postDisableAdmin({
            target_admin_id: record?.id,
            is_disabled: !record?.is_disabled,
          })
          .then((res) => {
            if (res.err == 0) {
              actionRef.current?.reload()
            }
          })
      },
      onCancel() {},
    })
  }, [])

  const columns: ProColumns<Columns>[] = useMemo(() => {
    return [
      {
        key: "account",
        title: "账号",
        align: "center",
        dataIndex: "account",
      },
      {
        key: "name",
        title: "名称",
        align: "center",
        dataIndex: "name",
      },
      {
        key: "email",
        title: "邮箱",
        align: "center",
        dataIndex: "email",
      },
      {
        key: "role",
        title: "角色",
        align: "center",
        dataIndex: "role",
        render: (val: string) => {
          return getRoles().find((item) => item.value == val)?.label
        },
      },
      {
        key: "is_disabled",
        title: "状态",
        align: "center",
        dataIndex: "is_disabled",
        render: (val) => {
          return val ? "禁用" : "正常"
        },
      },
      {
        width: 160,
        title: "操作",
        align: "center",
        valueType: "option",
        render: (_, record) => [
          record.account != "admin" && (
            <>
              <Button
                type={"primary"}
                onClick={() => {
                  handleDisabledAdmin(record)
                }}
              >
                {record.is_disabled ? "启用" : "禁用"}
              </Button>
              <Button type={"primary"} onClick={() => openResetPwdModal(record)}>
                重置密码
              </Button>
            </>
          ),
        ],
      },
    ]
  }, [])

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
        search={false}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => openCreateAdminModal()}
          >
            添加账号
          </Button>,
        ]}
      />

      <Modal
        title={"添加管理员"}
        open={createAdminModalVisible}
        onOk={handleCreateAdminSubmit}
        onCancel={handleCreateAdminCancel}
      >
        <Form form={createAdminForm}>
          <Form.Item
            name="account"
            label="登录账号"
            rules={[{ required: true, message: "请输入登录账号" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="管理员名称"
            rules={[{ required: true, message: "请输入管理员名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: "请输入邮箱" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: "请选择管理员角色" }]}
          >
            <Radio.Group options={getRoles()} />
          </Form.Item>
          <Form.Item
            name={"password"}
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={"重置密码"}
        open={resetPwdModalVisible}
        onOk={handleResetPwdSubmit}
        onCancel={handleResetPwdCancel}
      >
        <Form form={resetPwdForm}>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}

export default UserIndex

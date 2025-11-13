import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ProColumns } from "@ant-design/pro-components"
import { type ActionType, PageContainer, ProTable } from "@ant-design/pro-components"
import { Button, Form, Input, Modal, Radio, message } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import Services from "@/pages/admin/services"
import { USER_INFO } from "@/constants"

type Columns = API_PostAdminList.List

type CreateFormValues = {
  account: string
  name: string
  email: string
  role: string
  password: string
}

// 权限检查函数
const canOperateAdmin = (record: Columns, currentUser?: API_USER.Res) => {
  return record.account !== "admin" && (record.role !== "admin" || currentUser?.account === "admin")
}

const UserIndex: React.FC = () => {
  const actionRef = useRef<ActionType>()
  const formRef = useRef<any>()
  const [createAdminForm] = Form.useForm<CreateFormValues>()
  const [updateAdminForm] = Form.useForm<CreateFormValues>()
  const [resetPwdForm] = Form.useForm<CreateFormValues>()
  const [createAdminModalVisible, setCreateAdminModalVisible] = useState(false)
  const [resetPwdModalVisible, setResetPwdModalVisible] = useState(false)
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<Columns>()
  const [userinfo, setUserinfo] = useState<API_USER.Res>()
  const [loading, setLoading] = useState(false)

  // 统一错误处理
  const handleApiError = (error: any, operation: string) => {
    console.error(`${operation}失败:`, error)
    message.error(`${operation}失败，请稍后重试`)
  }

  const openCreateAdminModal = useCallback(() => {
    createAdminForm.resetFields()
    setCreateAdminModalVisible(true)
  }, [createAdminForm])

  const openResetPwdModal = useCallback(
    (record: Columns) => {
      setCurrentRecord(record)
      resetPwdForm.resetFields()
      setResetPwdModalVisible(true)
    },
    [resetPwdForm],
  )

  const openUpdateModal = useCallback(
    (record: Columns) => {
      setCurrentRecord(record)
      updateAdminForm.setFieldsValue({
        account: record.account,
        name: record.name,
        email: record.email,
        role: record.role,
      })
      setUpdateModalVisible(true)
    },
    [updateAdminForm],
  )

  const closeModal = useCallback((form: any, setVisible: (visible: boolean) => void) => {
    setVisible(false)
    form.resetFields()
  }, [])

  const handleApiCall = useCallback(async (apiCall: Promise<any>, successMessage: string) => {
    try {
      setLoading(true)
      const res = await apiCall
      if (res.err === 0) {
        message.success(successMessage)
        actionRef.current?.reload()
        return true
      }
    } catch (error) {
      handleApiError(error, successMessage)
    } finally {
      setLoading(false)
    }
    return false
  }, [])

  const handleUpdateModalSubmit = useCallback(async () => {
    try {
      const values = await updateAdminForm.validateFields()
      const success = await handleApiCall(
        Services.api.postAdminUpdate({ id: currentRecord?.id, ...values }),
        "修改用户成功",
      )
      if (success) {
        closeModal(updateAdminForm, setUpdateModalVisible)
      }
    } catch (error) {
      // 表单验证错误，不处理
    }
  }, [closeModal, currentRecord?.id, handleApiCall, updateAdminForm])

  const deleteAdmin = useCallback((record: Columns) => {
    Modal.confirm({
      title: "确认删除该用户吗？",
      onOk: async () => {
        await handleApiCall(Services.api.postAdminDelete({ id: record?.id }), "删除用户成功")
      },
    })
  }, [handleApiCall])

  const getLists = useCallback(async (params: any) => {
    try {
      const data = {
        page: params.current,
        limit: params.pageSize,
        ...params,
      }
      delete data.current
      delete data.pageSize

      const res = await Services.api.postAdminList(data)

      if (res) {
        return {
          total: res.res.total,
          data: res.res.list || [],
          success: true,
        }
      }
    } catch (error) {
      handleApiError(error, "获取用户列表")
    }
    return { data: [], success: false }
  }, [])

  const getRoles = useCallback(() => {
    const userInfo = JSON.parse(localStorage.getItem("userinfo") || "{}")
    return [
      {
        value: "admin",
        label: "超级管理员",
        disabled: userInfo?.account !== "admin",
      },
      { value: "user", label: "管理员" },
    ]
  }, [])

  const handleCreateAdminSubmit = useCallback(async () => {
    try {
      const values = await createAdminForm.validateFields()
      const success = await handleApiCall(Services.api.postAdminCreate(values), "添加用户成功")
      if (success) {
        closeModal(createAdminForm, setCreateAdminModalVisible)
      }
    } catch (error) {
      // 表单验证错误，不处理
    }
  }, [closeModal, createAdminForm, handleApiCall])

  const handleResetPwdSubmit = useCallback(async () => {
    try {
      const values = await resetPwdForm.validateFields()
      const success = await handleApiCall(
        Services.api.postAdminResetPwd({
          target_admin_id: currentRecord?.id,
          ...values,
        }),
        "重置密码成功",
      )
      if (success) {
        closeModal(resetPwdForm, setResetPwdModalVisible)
      }
    } catch (error) {
      // 表单验证错误，不处理
    }
  }, [closeModal, currentRecord?.id, handleApiCall, resetPwdForm])

  const handleDisabledAdmin = useCallback((record: Columns) => {
    const action = record.is_disabled ? "启用" : "禁用"
    Modal.confirm({
      title: `确认${action}`,
      content: `确认${action}该账号？`,
      onOk: async () => {
        await handleApiCall(
          Services.api.postDisableAdmin({
            target_admin_id: record?.id,
            is_disabled: !record?.is_disabled,
          }),
          `${action}用户成功`,
        )
      },
    })
  }, [handleApiCall])

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem(USER_INFO) || "{}")
    setUserinfo(userInfo)
  }, [])

  const columns: ProColumns<Columns>[] = useMemo(() => {
    const canOperateRecord = (record: Columns) => canOperateAdmin(record, userinfo)

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
          return getRoles().find((item) => item.value === val)?.label
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
        width: 200,
        title: "操作",
        align: "center",
        valueType: "option",
        render: (_, record) => {
          const actionButtons = []

          if (canOperateRecord(record)) {
            actionButtons.push(
              <Button key="disable" type="link" onClick={() => handleDisabledAdmin(record)}>
                {record.is_disabled ? "启用" : "禁用"}
              </Button>,
              <Button key="reset" type="link" onClick={() => openResetPwdModal(record)}>
                重置密码
              </Button>,
              <Button key="delete" type="link" onClick={() => deleteAdmin(record)}>
                删除
              </Button>,
            )
          }

          if (
            record.role !== "admin" ||
            record.account === userinfo?.account ||
            userinfo?.account === "admin"
          ) {
            actionButtons.push(
              <Button key="edit" type="link" onClick={() => openUpdateModal(record)}>
                修改
              </Button>,
            )
          }

          return actionButtons
        },
      },
    ]
  }, [deleteAdmin, getRoles, handleDisabledAdmin, openResetPwdModal, openUpdateModal, userinfo])

  return (
    <PageContainer>
      <ProTable<Columns>
        actionRef={actionRef}
        formRef={formRef}
        columns={columns}
        request={getLists}
        rowKey="id"
        loading={loading}
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
            onClick={openCreateAdminModal}
          >
            添加账号
          </Button>,
        ]}
      />

      <Modal
        title="添加管理员"
        open={createAdminModalVisible}
        onOk={handleCreateAdminSubmit}
        onCancel={() => closeModal(createAdminForm, setCreateAdminModalVisible)}
        confirmLoading={loading}
      >
        <Form form={createAdminForm} layout="vertical">
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
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
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
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="更新管理员"
        open={updateModalVisible}
        onOk={handleUpdateModalSubmit}
        onCancel={() => closeModal(updateAdminForm, setUpdateModalVisible)}
        confirmLoading={loading}
      >
        <Form form={updateAdminForm} layout="vertical">
          <Form.Item
            name="account"
            label="登录账号"
            rules={[{ required: true, message: "请输入登录账号" }]}
          >
            <Input readOnly />
          </Form.Item>
          <Form.Item
            name="name"
            label="管理员名称"
            rules={[{ required: true, message: "请输入管理员名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: "请选择管理员角色" }]}
          >
            <Radio.Group options={getRoles()} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重置密码"
        open={resetPwdModalVisible}
        onOk={handleResetPwdSubmit}
        onCancel={() => closeModal(resetPwdForm, setResetPwdModalVisible)}
        confirmLoading={loading}
      >
        <Form form={resetPwdForm} layout="vertical">
          <Form.Item
            name="password"
            label="新密码"
            rules={[{ required: true, message: "请输入新密码" }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}

export default UserIndex

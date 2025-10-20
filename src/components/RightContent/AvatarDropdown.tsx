import { LogoutOutlined, SettingOutlined, UserOutlined, LockOutlined } from "@ant-design/icons"
import { Avatar, Spin, Modal, Form, Input, message } from "antd"
// import type { ItemType } from "antd/lib/menu/hooks/useItems"
import type { MenuProps } from "antd"
import { stringify } from "querystring"
import type { MenuInfo } from "rc-menu/lib/interface"
import React, { useCallback } from "react"
import { history, useModel } from "umi"
import { removeUserInfo } from "@/utils/biz"
import { changePassword } from "@/pages/user/services/api"
import { LOGINPATH } from "@/constants"
import HeaderDropdown from "../HeaderDropdown"
import styles from "./index.less"

export type GlobalHeaderRightProps = {
  menu?: boolean
}

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  removeUserInfo()

  const { search, pathname } = window.location
  const urlParams = new URL(window.location.href).searchParams
  /** 此方法会跳转到 redirect 参数所在的位置 */
  const redirect = urlParams.get("redirect")
  // Note: There may be security issues, please note
  if (window.location.pathname !== LOGINPATH && !redirect) {
    history.replace({
      pathname: LOGINPATH,
      search: stringify({
        redirect: pathname + search,
      }),
    })
  }
}

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const { initialState, setInitialState } = useModel("@@initialState")
  const [visible, setVisible] = React.useState(false)
  const [form] = Form.useForm()

  const handleChangePassword = () => {
    form.validateFields().then(async (values) => {
      try {
        await changePassword({
          old_password: values.oldPassword,
          new_password: values.newPassword,
        }).then((res) => {
          if (res?.err === 0) {
            message.success("密码修改成功", 1, () => {
              loginOut()
            })
            setVisible(false)
            form.resetFields()
          } else {
            message.error(res?.msg || "密码修改失败")
          }
        })
      } catch (error) {
        message.error("密码修改失败")
      }
    })
  }

  const onClick: MenuProps["onClick"] = useCallback(
    async (event: MenuInfo) => {
      const { key } = event
      if (key === "changePassword") {
        setVisible(true)
        return
      }
      if (key === "logout") {
        await setInitialState((s: any) => {
          return {
            ...s,
            currentUser: undefined,
          }
        })

        loginOut()
        return
      }
      history.push(`/account/${key}`)
    },
    [setInitialState],
  )

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  )

  if (!initialState) {
    return loading
  }

  const { currentUser } = initialState

  if (!currentUser || !currentUser.name) {
    return loading
  }

  const items: MenuProps["items"] = [
    ...(menu
      ? [
          {
            key: "center",
            icon: <UserOutlined />,
            label: "个人中心",
          },
          {
            key: "settings",
            icon: <SettingOutlined />,
            label: "个人设置",
          },
          {
            type: "divider" as const,
          },
        ]
      : []),
    {
      key: "changePassword",
      icon: <LockOutlined />,
      label: "修改密码",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
    },
  ]

  return (
    <>
      <Modal
        title="修改密码"
        open={visible}
        onOk={handleChangePassword}
        onCancel={() => setVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="oldPassword"
            label="旧密码"
            rules={[{ required: true, message: "请输入旧密码" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 8, message: "密码长度至少8位" },
              {
                validator: (_, value) => {
                  // 检查是否包含非法字符
                  if (/[^a-zA-Z0-9!@#$%^&*]/.test(value)) {
                    return Promise.reject(new Error("密码只能包含字母、数字和!@#$%^&*"))
                  }

                  const hasLetter = /[a-zA-Z]/.test(value)
                  const hasNumber = /\d/.test(value)
                  const hasPunctuation = /[!@#$%^&*]/.test(value)
                  const typesCount = [hasLetter, hasNumber, hasPunctuation].filter(Boolean).length

                  if (typesCount >= 2) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("密码需包含字母、数字及!@#$%^&*中的两种及以上"))
                },
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"))
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
      <HeaderDropdown menu={{ items, onClick }}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar size="small" className={styles.avatar} icon={<UserOutlined />} alt="avatar" />
          <span className={`${styles.name} anticon`}>{currentUser.name}</span>
        </span>
      </HeaderDropdown>
    </>
  )
}

export default AvatarDropdown

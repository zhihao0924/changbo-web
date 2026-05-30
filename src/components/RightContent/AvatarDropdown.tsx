import { LogoutOutlined, SettingOutlined, UserOutlined, LockOutlined } from "@ant-design/icons"
import { Avatar, Spin, Modal, Form, Input, message } from "antd"
// import type { ItemType } from "antd/lib/menu/hooks/useItems"
import type { MenuProps } from "antd"
import { stringify } from "querystring"
import type { MenuInfo } from "rc-menu/lib/interface"
import React, { useCallback } from "react"
import { history, useIntl, useModel } from "umi"
import { removeUserInfo } from "@/utils/biz"
import { changePassword } from "@/pages/user/services/api"
import { LOGINPATH } from "@/constants"
import { formatApiResponseMessage } from "@/utils/i18n"
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
  const intl = useIntl()
  const [visible, setVisible] = React.useState(false)
  const [form] = Form.useForm()

  const formatMessage = useCallback(
    (id: string, defaultMessage: string) =>
      intl.formatMessage({
        id,
        defaultMessage,
      }),
    [intl],
  )

  const handleChangePassword = () => {
    form.validateFields().then(async (values) => {
      try {
        await changePassword({
          old_password: values.oldPassword,
          new_password: values.newPassword,
        }).then((res) => {
          if (res?.err === 0) {
            message.success(
              formatApiResponseMessage(
                res,
                formatMessage("app.user.password.change.success", "Password changed successfully"),
              ),
              1,
              () => {
                loginOut()
              },
            )
            setVisible(false)
            form.resetFields()
          } else {
            message.error(
              formatApiResponseMessage(
                res,
                formatMessage("app.user.password.change.failed", "Failed to change password"),
              ),
            )
          }
        })
      } catch (error) {
        message.error(
          formatApiResponseMessage(
            error as any,
            formatMessage("app.user.password.change.failed", "Failed to change password"),
          ),
        )
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
            label: formatMessage("app.user.center", "Profile"),
          },
          {
            key: "settings",
            icon: <SettingOutlined />,
            label: formatMessage("app.user.settings", "Settings"),
          },
          {
            type: "divider" as const,
          },
        ]
      : []),
    {
      key: "changePassword",
      icon: <LockOutlined />,
      label: formatMessage("app.user.password.change", "Change Password"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: formatMessage("app.user.logout", "Log out"),
    },
  ]

  return (
    <>
      <Modal
        title={formatMessage("app.user.password.change", "Change Password")}
        open={visible}
        onOk={handleChangePassword}
        onCancel={() => setVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="oldPassword"
            label={formatMessage("app.user.password.old", "Current Password")}
            rules={[
              {
                required: true,
                message: formatMessage(
                  "app.user.password.old.required",
                  "Please enter your current password",
                ),
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={formatMessage("app.user.password.new", "New Password")}
            rules={[
              {
                required: true,
                message: formatMessage(
                  "app.user.password.new.required",
                  "Please enter a new password",
                ),
              },
              {
                min: 8,
                message: formatMessage(
                  "app.user.password.new.min",
                  "Password must be at least 8 characters",
                ),
              },
              {
                validator: (_, value) => {
                  // 检查是否包含非法字符
                  if (/[^a-zA-Z0-9!@#$%^&*]/.test(value)) {
                    return Promise.reject(
                      new Error(
                        formatMessage(
                          "app.user.password.new.charset",
                          "Password can only contain letters, numbers, and !@#$%^&*",
                        ),
                      ),
                    )
                  }

                  const hasLetter = /[a-zA-Z]/.test(value)
                  const hasNumber = /\d/.test(value)
                  const hasPunctuation = /[!@#$%^&*]/.test(value)
                  const typesCount = [hasLetter, hasNumber, hasPunctuation].filter(Boolean).length

                  if (typesCount >= 2) {
                    return Promise.resolve()
                  }
                  return Promise.reject(
                    new Error(
                      formatMessage(
                        "app.user.password.new.complexity",
                        "Password must include at least two of the following: letters, numbers, and !@#$%^&*",
                      ),
                    ),
                  )
                },
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={formatMessage("app.user.password.confirm", "Confirm Password")}
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: formatMessage(
                  "app.user.password.confirm.required",
                  "Please confirm your new password",
                ),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(
                    new Error(
                      formatMessage(
                        "app.user.password.confirm.mismatch",
                        "The two passwords do not match",
                      ),
                    ),
                  )
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

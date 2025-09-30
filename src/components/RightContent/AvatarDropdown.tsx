import { LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons"
import { Avatar, Spin } from "antd"
// import type { ItemType } from "antd/lib/menu/hooks/useItems"
import type { MenuProps } from "antd"
import { stringify } from "querystring"
import type { MenuInfo } from "rc-menu/lib/interface"
import React, { useCallback } from "react"
import { history, useModel } from "umi"
import { removeUserInfo } from "@/utils/biz"
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

  const onClick: MenuProps["onClick"] = useCallback(
    async (event: MenuInfo) => {
      const { key } = event
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
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
    },
  ]

  return (
    <HeaderDropdown menu={{ items, onClick }}>
      <span className={`${styles.action} ${styles.account}`}>
        <Avatar size="small" className={styles.avatar} icon={<UserOutlined />} alt="avatar" />
        <span className={`${styles.name} anticon`}>{currentUser.name}</span>
      </span>
    </HeaderDropdown>
  )
}

export default AvatarDropdown

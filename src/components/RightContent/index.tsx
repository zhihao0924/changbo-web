import { Space } from "antd"
import React from "react"
import { useModel } from "umi"
import Avatar from "./AvatarDropdown"
import TimeLine from "../timeLine"
import styles from "./index.less"

export type SiderTheme = "light" | "dark"

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel("@@initialState")

  const { showModal, setShowModalCB } = useModel("useGlobal")

  if (!initialState || !initialState?.settings) {
    return null
  }

  const { navTheme, layout } = initialState?.settings
  let className = styles.right

  if ((navTheme === "realDark" && layout === "top") || layout === "mix") {
    className = `${styles.right}  ${styles.dark}`
  }

  return (
    <Space className={className}>
      <Avatar />
      <TimeLine showModal={showModal} onCloseModal={() => setShowModalCB(false)} />
      {/* <SelectLang className={styles.action} /> */}
    </Space>
  )
}
export default GlobalHeaderRight

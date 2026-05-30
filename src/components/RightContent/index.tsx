import React from "react"
import { SelectLang, useModel } from "umi"
import Avatar from "./AvatarDropdown"
import TimeLine from "../timeLine"
import styles from "./index.less"
import { I18N_ENABLED } from "@/utils/i18n"

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
    <div className={className}>
      <TimeLine showModal={showModal} onCloseModal={() => setShowModalCB(false)} />
      <Avatar />
      {I18N_ENABLED && <SelectLang className={`${styles.action} ${styles.langAction}`} />}
    </div>
  )
}
export default GlobalHeaderRight

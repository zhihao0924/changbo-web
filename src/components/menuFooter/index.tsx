import { CarOutlined } from "@ant-design/icons"
import { useModel } from "umi"
import React, { useCallback, useMemo } from "react"
import PackageJson from "../../../package.json"
import styles from "./index.less"

type MenuFooterProps = {
  collapsed?: boolean
}

const MenuFooter: React.FC<MenuFooterProps> = (props) => {
  const { collapsed } = props
  const { setShowModalCB } = useModel("useGlobal")

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault()

      setShowModalCB(true)
    },
    [setShowModalCB],
  )

  return useMemo(() => {
    return (
      <div className={styles.footer__area}>
        <div className={styles["footer__area-ver"]}>v{PackageJson.version}</div>

        <div onClick={onClick} className={styles["footer__area-btn"]}>
          <CarOutlined />
          {!collapsed && <span>版本更新记录</span>}
        </div>
      </div>
    )
  }, [onClick, collapsed])
}

export default MenuFooter

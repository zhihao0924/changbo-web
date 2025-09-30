// import { ACCESS_TOKEN, REFRESH_TOKEN, USER_INFO } from "@/constants"
import { Spin } from "antd"
import { Fragment, useEffect, useMemo } from "react"

export type Props = {
  location: any
}

const CallBack: React.FC<Props> = ({ location }) => {
  console.log(location.query, "query")

  useEffect(() => {}, [])

  return useMemo(() => {
    return (
      <Fragment>
        <div>
          <Spin tip="登录中..." />
        </div>
      </Fragment>
    )
  }, [])
}

export default CallBack

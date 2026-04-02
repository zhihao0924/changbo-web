// import { ACCESS_TOKEN, REFRESH_TOKEN, USER_INFO } from "@/constants"
import { Spin } from "antd"
import { Fragment, useEffect, useMemo } from "react"
import { useIntl } from "umi"

export type Props = {
  location: any
}

const CallBack: React.FC<Props> = ({ location }) => {
  console.log(location.query, "query")
  const intl = useIntl()

  useEffect(() => {}, [])

  return useMemo(() => {
    return (
      <Fragment>
        <div>
          <Spin
            tip={intl.formatMessage({
              id: "app.login.loggingIn",
              defaultMessage: "Signing in...",
            })}
          />
        </div>
      </Fragment>
    )
  }, [intl])
}

export default CallBack

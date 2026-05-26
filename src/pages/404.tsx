import { Button, Result } from "antd"
import React from "react"
import { history, useIntl } from "umi"

const NoFoundPage: React.FC = () => {
  const intl = useIntl()
  const t = (id: string, defaultMessage: string) => intl.formatMessage({ id, defaultMessage })

  return (
    <Result
      status="404"
      title="404"
      subTitle={t("app.404.subtitle", "Sorry, the page you visited does not exist.")}
      extra={
        <Button type="primary" onClick={() => history.push("/")}>
          {t("app.404.backHome", "Back Home")}
        </Button>
      }
    />
  )
}

export default NoFoundPage

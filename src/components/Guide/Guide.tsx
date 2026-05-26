import { Layout, Row, Typography } from "antd"
import React from "react"
import { useIntl } from "umi"
import styles from "./Guide.less"

interface Props {
  name: string
}

// 脚手架示例组件
const Guide: React.FC<Props> = (props) => {
  const { name } = props
  const intl = useIntl()
  return (
    <Layout>
      <Row>
        <Typography.Title level={3} className={styles.title}>
          {intl.formatMessage({ id: "app.guide.welcome", defaultMessage: "Welcome to" })}{" "}
          <strong>{name}</strong>！
        </Typography.Title>
      </Row>
    </Layout>
  )
}

export default Guide

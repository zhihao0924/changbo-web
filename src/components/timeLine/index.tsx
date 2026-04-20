import { SmileOutlined } from "@ant-design/icons"
import React from "react"
import { Timeline, Card, Modal } from "antd"
import { useIntl } from "umi"
import Version from "@/version.json"
import styles from "./index.less"

type propsType = {
  showModal: boolean
  onCloseModal: () => void
}

const LogTimeLine: React.FC<propsType> = (props) => {
  const { showModal, onCloseModal } = props
  const intl = useIntl()

  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({
      id,
      defaultMessage,
    })

  return (
    <Modal
      title={t("app.version.timeline", "Version Timeline")}
      open={showModal}
      destroyOnClose
      footer={null}
      bodyStyle={{
        height: window.innerHeight - 300,
        overflow: "scroll",
      }}
      onCancel={onCloseModal}
    >
      <Card title="" bordered={false}>
        <Timeline>
          {Version ? (
            Object.keys(Version.description).map((val: any, idx) => {
              const text = (
                <>
                  <b>{`v${val}`}</b>
                  <div>
                    {t("app.version.updatedAt", "Updated at")}: {Version.description[val].time}
                  </div>
                  <div className={styles.update__area}>
                    <div className={styles["update__area-title"]}>
                      {t("app.version.updateContent", "Updates")}:
                    </div>
                    <div>
                      {Version.description[val].update.map((v: any, i: number) => {
                        return (
                          <div key={v}>
                            {i + 1}: {v}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )
              return idx == 0 ? (
                <Timeline.Item key={val} color="green" dot={<SmileOutlined />}>
                  {text}
                </Timeline.Item>
              ) : (
                <Timeline.Item key={val}>{text}</Timeline.Item>
              )
            })
          ) : (
            <div>{t("app.common.none", "None")}</div>
          )}
        </Timeline>
      </Card>
    </Modal>
  )
}

export default LogTimeLine

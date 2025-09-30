import { SmileOutlined } from "@ant-design/icons"
import React, { useMemo } from "react"
import { Timeline, Card, Modal } from "antd"
import Version from "@/version.json"
import styles from "./index.less"

type propsType = {
  showModal: boolean
  onCloseModal: () => void
}

const LogTimeLine: React.FC<propsType> = (props) => {
  const { showModal, onCloseModal } = props

  return useMemo(() => {
    return (
      <Modal
        title="版本更新时间轴"
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
                    <div>更新时间：{Version.description[val].time}</div>
                    <div className={styles.update__area}>
                      <div className={styles["update__area-title"]}>更新内容：</div>
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
              <div>无</div>
            )}
          </Timeline>
        </Card>
      </Modal>
    )
  }, [showModal, onCloseModal])
}

export default LogTimeLine

import Footer from "@/components/Footer"
import {
  ACCESS_TOKEN,
  ACCESS_TOKEN_EXPIRE,
  DEFAULT_NAME,
  REFRESH_AFTER,
  USER_INFO,
} from "@/constants"
import Services from "@/pages/user/services"
import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { LoginFormPage, ProFormText } from "@ant-design/pro-form"
import { Alert, message, Tabs } from "antd"
import { useCallback, useEffect, useMemo, useState } from "react"
import { history, useModel } from "umi"
import styles from "./index.less"

type LoginType = "account"

const LoginMessage: React.FC<{
  content: string
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
)

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState("")
  const [type, setType] = useState<LoginType>("account")
  const { loading, setInitialState } = useModel("@@initialState")

  const handleLoginAuto = () => {
    const token = localStorage.getItem(ACCESS_TOKEN)

    if (token) {
      const { query } = history.location
      const { redirect } = query as {
        redirect: string
      }
      window.location.replace(redirect || "/")
    } else {
      localStorage.removeItem(ACCESS_TOKEN)
      localStorage.removeItem(USER_INFO)
    }
  }

  const fetchUserInfo = useCallback(
    async (info) => {
      const { jwtToken, name, account, role } = info

      localStorage.setItem(ACCESS_TOKEN, jwtToken.access_token.toString())
      localStorage.setItem(ACCESS_TOKEN_EXPIRE, jwtToken.access_expire.toString())
      localStorage.setItem(REFRESH_AFTER, jwtToken.refresh_after.toString())
      localStorage.setItem(USER_INFO, JSON.stringify({ jwtToken, name, account, role }))

      await setInitialState((s: any) => {
        return {
          ...s,
          currentUser: { jwtToken, name, account, role },
        }
      })
    },
    [setInitialState],
  )

  // const setQrCode = () => {
  //   const info = {
  //     client_id: "",
  //     redirect_uri: "",
  //     response_type: "code",
  //     state: "middle",
  //   }
  //   const goto = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${info.client_id}&redirect_uri=${info.redirect_uri}&response_type=${info.response_type}&state=${info.state}`
  //   const QRLoginObj = window.QRLogin({
  //     id: "qrcode",
  //     goto,
  //     width: "260",
  //     height: "260",
  //     style: "width:260px;height:260px", //可选的，二维码html标签的style属性
  //   })
  //   const handleMessage = function (event: any) {
  //     const origin = event.origin
  //     // 使用 matchOrigin 方法来判断 message 来自页面的url是否合法
  //     if (QRLoginObj.matchOrigin(origin)) {
  //       const loginTmpCode = event.data
  //       // 在授权页面地址上拼接上参数 tmp_code，并跳转
  //       window.location.href = `${goto}&tmp_code=${loginTmpCode}`
  //     }
  //   }
  //   if (typeof window.addEventListener != "undefined") {
  //     window.addEventListener("message", handleMessage, false)
  //   } else if (typeof window.attachEvent != "undefined") {
  //     window.attachEvent("onmessage", handleMessage)
  //   }
  // }

  const handleSubmit = useCallback(
    async (values: any) => {
      // console.log(values, "values")
      try {
        // 登录
        const res = await Services.api.logIn({
          ...values,
        })

        if (res.err == 0) {
          const defaultLoginSuccessMessage = "登录成功！"
          message.success(defaultLoginSuccessMessage)
          await fetchUserInfo(res.res).then(() => {
            /** 此方法会跳转到 redirect 参数所在的位置 */
            if (!history) return

            setTimeout(() => {
              const { query } = history.location
              const { redirect } = query as { redirect: string }
              history.push(redirect || "/")
            }, 300)
          })

          return
        }

        console.log(res)

        // 如果失败去设置用户错误信息

        setUserLoginState("error")
      } catch (error) {
        // const defaultLoginFailureMessage = "登录失败，请重试！"
        // message.error(defaultLoginFailureMessage)
      }
    },
    [fetchUserInfo, loading],
  )

  useEffect(() => {
    const abortController = new AbortController()
    handleLoginAuto()
    // setQrCode()
    return () => {
      abortController.abort()
    }
  }, [])

  return useMemo(() => {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <LoginFormPage
            backgroundImageUrl="/logIn_bg.png"
            logo={<img alt="logo" src="/logo.png" />}
            title={DEFAULT_NAME}
            subTitle=""
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values: any) => {
              await handleSubmit(values)
            }}
            actions={<Footer />}
            submitter={{
              render: (props, dom) => {
                return type == "account" ? [dom[1]] : []
              },
            }}
          >
            <Tabs
              activeKey={type}
              onChange={(activeKey) => {
                setType(activeKey as LoginType)
              }}
              items={[
                {
                  label: "账户密码登录",
                  key: "account",
                },
              ]}
            />

            {userLoginState === "error" && type === "account" && (
              <LoginMessage content={"账户或密码错误"} />
            )}
            {type === "account" && (
              <>
                <ProFormText
                  name="account"
                  fieldProps={{
                    size: "large",
                    prefix: <UserOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder="请输入用户名"
                  rules={[
                    {
                      required: true,
                      message: "请输入用户名!",
                    },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  fieldProps={{
                    size: "large",
                    prefix: <LockOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder="请输入密码"
                  rules={[
                    {
                      required: true,
                      message: "请输入密码！",
                    },
                  ]}
                />
              </>
            )}
          </LoginFormPage>
        </div>
      </div>
    )
  }, [type, userLoginState, handleSubmit])
}

export default Login

import Footer from "@/components/Footer"
import {
  ACCESS_TOKEN,
  ACCESS_TOKEN_EXPIRE,
  REFRESH_AFTER,
  SYSTEM_CONFIG,
  USER_INFO,
} from "@/constants"
import Services from "@/pages/user/services"
import { postSystemConfig } from "@/pages/setting/services/api"
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
  const [systemConfig, setSystemConfig] = useState<any>(null)
  const { setInitialState } = useModel("@@initialState")

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
    async (info: any) => {
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

          try {
            await fetchUserInfo(res.res)

            /** 此方法会跳转到 redirect 参数所在的位置 */
            if (!history) {
              console.error("history 不可用")
              return
            }

            // 减少延迟时间，避免被其他逻辑干扰
            setTimeout(() => {
              const { query } = history.location
              const { redirect } = query as { redirect: string }
              console.log("准备跳转到:", redirect || "/")
              history.push(redirect || "/")
            }, 100)
          } catch (fetchError) {
            console.error("获取用户信息失败:", fetchError)
            message.error("登录成功但获取用户信息失败，请重新登录")
            setUserLoginState("error")
          }

          return
        }

        console.log("登录失败:", res.msg || res)
        setUserLoginState("error")
        message.error(res.msg || "登录失败，请重试")
      } catch (error) {
        console.error("登录异常:", error)
        setUserLoginState("error")
        message.error("登录异常，请重试")
      }
    },
    [fetchUserInfo],
  )

  // 获取系统配置
  const fetchSystemConfig = async () => {
    try {
      console.log("开始获取系统配置...")
      const res = await postSystemConfig({})
      console.log("系统配置响应:", res)
      if (res.err === 0) {
        // 将系统配置存储到 localStorage
        localStorage.setItem(SYSTEM_CONFIG, JSON.stringify(res.res))
        setSystemConfig(res.res)
        console.log("系统配置获取成功:", res.res)
        return res.res
      } else {
        console.error("系统配置接口返回错误:", res.msg)
        return null
      }
    } catch (error) {
      console.error("获取系统配置失败:", error)
      return null
    }
  }

  useEffect(() => {
    const abortController = new AbortController()

    const initSystemConfig = async () => {
      // 如果没有系统配置，从后台获取
      console.log("没有缓存配置，从后台获取...")
      await fetchSystemConfig()
    }

    // 不等待系统配置获取完成，避免阻塞页面渲染
    initSystemConfig().catch((error) => {
      console.error("系统配置初始化异常:", error)
    })
    handleLoginAuto()
    // setQrCode()
    return () => {
      abortController.abort()
    }
  }, [])

  return useMemo(() => {
    // 使用状态中的系统配置数据
    let logoUrl = "" // 默认logo
    let systemName = "" // 默认名称

    if (systemConfig) {
      if (systemConfig.system_logo) {
        logoUrl = systemConfig.system_logo
      }

      if (systemConfig.system_name) {
        systemName = systemConfig.system_name
      }
    }

    // 如果没有获取到系统配置，使用默认值
    if (!logoUrl) logoUrl = "/logo.png"
    if (!systemName) systemName = "畅博管理系统"

    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <LoginFormPage
            backgroundImageUrl="/logIn_bg.png"
            logo={<img alt="logo" src={logoUrl} />}
            title={systemName}
            subTitle=""
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values: any) => {
              await handleSubmit(values)
            }}
            actions={<Footer />}
            submitter={{
              render: (props: any, dom: any) => {
                return type == "account" ? [dom[1]] : []
              },
            }}
          >
            <Tabs
              activeKey={type}
              onChange={(activeKey: string) => {
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
  }, [type, userLoginState, handleSubmit, systemConfig])
}

export default Login

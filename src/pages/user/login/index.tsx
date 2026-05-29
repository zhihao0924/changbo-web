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
import { resolveSystemDisplayName } from "@/utils/i18n"
import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { ProForm, ProFormText } from "@ant-design/pro-form"
import { Alert, message, Tabs } from "antd"
import { useCallback, useEffect, useMemo, useState } from "react"
import { history, useIntl, useModel } from "umi"
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
  const intl = useIntl()
  const isEnglish = intl.locale === "en-US"

  const formatMessage = useCallback(
    (id: string, defaultMessage: string) =>
      intl.formatMessage({
        id,
        defaultMessage,
      }),
    [intl],
  )

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
      try {
        // 登录
        const res = await Services.api.logIn({
          ...values,
        })

        if (res.err == 0) {
          const defaultLoginSuccessMessage = formatMessage(
            "pages.login.success",
            "Login successful!",
          )
          message.success(defaultLoginSuccessMessage)

          try {
            await fetchUserInfo(res.res).then(() => {
              // 减少延迟时间，避免被其他逻辑干扰
              setTimeout(() => {
                const { query } = history.location
                const { redirect } = query as { redirect: string }
                history.push(redirect || "/")
              }, 100)
            })

            /** 此方法会跳转到 redirect 参数所在的位置 */
            if (!history) {
              return
            }
          } catch (fetchError) {
            message.error(
              formatMessage(
                "app.login.fetchUserInfo.failed",
                "Login succeeded, but loading user info failed. Please sign in again.",
              ),
            )
            setUserLoginState("error")
          }

          return
        }

        setUserLoginState("error")
        message.error(
          res.msg || formatMessage("pages.login.failure", "Login failed, please try again!"),
        )
      } catch (error) {
        setUserLoginState("error")
        message.error(
          formatMessage("app.login.exception", "A login error occurred. Please try again."),
        )
      }
    },
    [fetchUserInfo, formatMessage],
  )

  // 获取系统配置
  const fetchSystemConfig = async () => {
    try {
      const res = await postSystemConfig({})
      if (res.err === 0) {
        // 将系统配置存储到 localStorage
        localStorage.setItem(SYSTEM_CONFIG, JSON.stringify(res.res))
        setSystemConfig(res.res)
        return res.res
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }

  useEffect(() => {
    const abortController = new AbortController()

    const initSystemConfig = async () => {
      // 如果没有系统配置，从后台获取
      await fetchSystemConfig()
    }

    // 不等待系统配置获取完成，避免阻塞页面渲染
    initSystemConfig().catch(() => {})
    handleLoginAuto()
    // setQrCode()
    return () => {
      abortController.abort()
    }
  }, [])

  const systemName = useMemo(() => {
    return resolveSystemDisplayName(
      systemConfig?.system_name,
      formatMessage("app.system.defaultName", "Private Network Communication Intelligent NMS"),
    )
  }, [formatMessage, systemConfig?.system_name])

  const systemLogo = useMemo(() => systemConfig?.system_logo?.trim() || "/logo.png", [systemConfig])

  useEffect(() => {
    const loginTitle = formatMessage("app.login.pageTitle", "Login")
    document.title = systemName ? `${loginTitle} - ${systemName}` : loginTitle
  }, [formatMessage, systemName])

  return useMemo(() => {
    return (
      <div className={styles.container}>
        <main className={styles.shell}>
          <section className={styles.brandPane}>
            <div className={styles.brandContent}>
              <div className={styles.logoMark}>
                <img src={systemLogo} alt={systemName} />
              </div>
              <div className={styles.brandKicker}>
                {formatMessage("pages.login.brand.kicker", "Network Operations")}
              </div>
              <h1 className={`${styles.brandTitle} ${isEnglish ? styles.brandTitleEn : ""}`}>
                {systemName}
              </h1>
              <p className={styles.brandDesc}>
                {formatMessage(
                  "pages.login.brand.desc",
                  "Unified access for secure private-network operations.",
                )}
              </p>
              <div className={styles.signalBar} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          </section>

          <section className={styles.loginPane}>
            <div className={styles.loginPanel}>
              <div className={styles.loginHeader}>
                <span>{formatMessage("pages.login.form.kicker", "Account Access")}</span>
                <h2>{formatMessage("pages.login.form.title", "Secure sign in")}</h2>
                <p>{formatMessage("pages.login.form.subtitle", "Use your assigned account.")}</p>
              </div>

              <ProForm
                className={styles.loginForm}
                initialValues={{
                  autoLogin: true,
                }}
                onFinish={async (values: any) => {
                  await handleSubmit(values)
                }}
                submitter={{
                  searchConfig: {
                    submitText: formatMessage("pages.login.submit", "Login"),
                  },
                  submitButtonProps: {
                    className: styles.submitButton,
                    size: "large",
                  },
                  render: (props: any, dom: any) => {
                    return type == "account" ? [dom[1]] : []
                  },
                }}
              >
                <Tabs
                  className={styles.loginTabs}
                  activeKey={type}
                  onChange={(activeKey: string) => {
                    setType(activeKey as LoginType)
                  }}
                  items={[
                    {
                      label: formatMessage("pages.login.accountLogin.tab", "Account Login"),
                      key: "account",
                    },
                  ]}
                />

                {userLoginState === "error" && type === "account" && (
                  <LoginMessage
                    content={formatMessage(
                      "app.login.account.error",
                      "Incorrect username or password",
                    )}
                  />
                )}
                {type === "account" && (
                  <>
                    <ProFormText
                      name="account"
                      fieldProps={{
                        size: "large",
                        prefix: <UserOutlined className={styles.prefixIcon} />,
                      }}
                      placeholder={formatMessage(
                        "app.login.username.placeholder",
                        "Please enter username",
                      )}
                      rules={[
                        {
                          required: true,
                          message: formatMessage(
                            "app.login.username.required",
                            "Please enter username",
                          ),
                        },
                      ]}
                    />
                    <ProFormText.Password
                      name="password"
                      fieldProps={{
                        size: "large",
                        prefix: <LockOutlined className={styles.prefixIcon} />,
                      }}
                      placeholder={formatMessage(
                        "app.login.password.placeholder",
                        "Please enter password",
                      )}
                      rules={[
                        {
                          required: true,
                          message: formatMessage(
                            "app.login.password.required",
                            "Please enter password",
                          ),
                        },
                      ]}
                    />
                  </>
                )}
              </ProForm>

              <div className={styles.footer}>
                <Footer />
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }, [formatMessage, handleSubmit, isEnglish, systemLogo, systemName, type, userLoginState])
}

export default Login

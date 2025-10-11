// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://next.umijs.org/docs/api/runtime-config#getinitialstate

import { PageLoading } from "@ant-design/pro-components"
import type { Settings as LayoutSettings } from "@ant-design/pro-components"
import type { RunTimeLayoutConfig } from "umi"
import { history } from "umi"
import { message } from "antd"
import moment from "moment"
import { USER_INFO, LOGINPATH, CALLBACKPATH } from "@/constants"
import { removeUserInfo, getUserInfo } from "@/utils/biz"
import { stringify } from "querystring"
import { checkVersion } from "version-rocket"
import PackageJson from "../package.json"
import { versionTipDialog } from "@/components/versionTipDialog"
import MenuFooter from "@/components/menuFooter"
import Footer from "@/components/Footer"
import RightContent from "@/components/RightContent"
import defaultSettings from "../config/defaultSettings"

const excludePath = [LOGINPATH, CALLBACKPATH]

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
}

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>
  loading?: boolean
  currentUser?: API_USER.Res
  fetchUserInfo?: () => Promise<API_USER.Res | undefined>
}> {
  if (process.env.NODE_ENV !== "development") {
    if (process.env.BUILD_ENV == "prod" || process.env.BUILD_ENV == "dev") {
      checkVersion({
        localPackageVersion: PackageJson.version,
        originVersionFileUrl: `${location.origin}/version.json`,
        immediate: true,
        pollingTime: 30 * 60 * 1000,
        onVersionUpdate: (event) => {
          versionTipDialog({
            newVersion: event.refreshPageVersion,
            description: event.external.description,
            primaryColor: "#1890ff",
            rocketColor: "#1890ff",
          })
        },
      })
    }
  }

  const fetchUserInfo = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem(USER_INFO) || "{}")
      return userInfo
    } catch (error) {
      history.push(LOGINPATH)
    }
    return undefined
  }

  // 如果是登录页面，不执行
  if (!excludePath.includes(history.location.pathname)) {
    const currentUser = await fetchUserInfo()
    const data = {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    }
    return data
  }

  return {
    fetchUserInfo,
    settings: defaultSettings,
  }
}

const expire = async () => {
  const controller = new AbortController()

  const userInfo = (await getUserInfo()) as API_USER.Res

  const expireTimeStamp = userInfo?.jwtToken?.refresh_after

  const nowTimeStamp = Math.round(moment().valueOf() / 1000)

  const { search, pathname } = window.location

  if (nowTimeStamp >= expireTimeStamp) {
    message.error("token失效，请重新登陆！")

    controller.abort()

    setTimeout(() => {
      removeUserInfo()

      history.replace({
        pathname: LOGINPATH,
        search: stringify({
          redirect: pathname + search,
        }),
      })
    }, 300)
  }
}

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    // footerRender: () => <Footer />,
    menuHeaderRender: undefined,
    // menuFooterRender: (menuProps: any) => {
    //   return <MenuFooter collapsed={menuProps.collapsed} />
    // },
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    //   zIndex: 0,
    // },
    onPageChange: () => {
      const { location } = history
      const isAuthPage = excludePath.every((item) => !location.pathname.startsWith(item))
      const { search, pathname } = window.location

      if (isAuthPage) {
        if (!initialState?.currentUser || JSON.stringify(initialState?.currentUser) == "{}") {
          history.replace({
            pathname: LOGINPATH,
            search: stringify({
              redirect: pathname + search,
            }),
          })
        }
      }
    },
    ...initialState?.settings,
  }
}

export function onRouteChange({ location }: any) {
  const isAuthPage = excludePath.every((item) => !location.pathname.startsWith(item))

  if (isAuthPage) {
    expire()
  }
}

export function patchRoutes({ routes }: any) {
  // console.log(routes, "routes")
  routes[0].routes.push({
    path: "*",
    component: require("@/pages/404").default,
  })
}

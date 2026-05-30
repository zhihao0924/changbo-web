/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/**
 * Universal request
 */
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, LOGINPATH, REFRESH_AFTER, USER_INFO } from "@/constants"
import { message } from "antd"
import type { AxiosError, AxiosRequestConfig } from "axios"
import axios from "axios"
import qs from "qs"
import proxy from "config/proxy"
import { removeUserInfo } from "@/utils/biz"
import { history } from "umi"
import { stringify } from "querystring"
import { refreshToken } from "@/pages/user/services/api"
import { formatApiResponseMessage, formatRuntimeMessage, getRuntimeLocale } from "@/utils/i18n"

// params 仅仅包含常用 url method headers description

// 防抖机制，避免频繁调用刷新token
let lastRefreshTime = 0
const REFRESH_DEBOUNCE_TIME = 30000 // 30秒防抖时间
// const notify = (msg: string, title="提示") => {
//   notification.error({
//     message: title,
//     description: msg,
//     style: {
//       whiteSpace: "pre-wrap",
//     },
//   })
// }

const { search, pathname } = window.location
const redirectLoginPath = {
  pathname: LOGINPATH,
  search: stringify({
    redirect: pathname + search,
  }),
}

let controller = new AbortController()

// axios.interceptors.response.use(
//   (response) => {
//     return response
//   },
//   (err) => {
//     return Promise.reject(err)
//   },
// )

// 检查token是否需要刷新
const checkAndRefreshToken = async () => {
  const refreshAfter = localStorage.getItem(REFRESH_AFTER)
  const accessTokenExpire = localStorage.getItem(ACCESS_TOKEN_EXPIRE)
  const accessToken = localStorage.getItem(ACCESS_TOKEN)

  // 如果没有token或过期时间，直接返回
  if (!accessToken || !accessTokenExpire || !refreshAfter) {
    return false
  }

  const now = Math.round(Date.now() / 1000)
  const refreshAfterTime = parseInt(refreshAfter)

  // 如果当前时间超过了refresh_after时间，需要刷新token
  if (now >= refreshAfterTime) {
    try {
      const res = await refreshToken({ showToast: false })

      // refreshToken API 返回标准格式 {err, msg, res}
      if (res && res.err === 0 && res.res) {
        const jwtToken = res.res
        // 更新本地存储的token信息
        localStorage.setItem(ACCESS_TOKEN, jwtToken.access_token)
        localStorage.setItem(ACCESS_TOKEN_EXPIRE, jwtToken.access_expire.toString())
        localStorage.setItem(REFRESH_AFTER, jwtToken.refresh_after.toString())

        // 更新USER_INFO中的jwtToken
        const userInfoStr = localStorage.getItem(USER_INFO)
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr)
          userInfo.jwtToken = jwtToken
          localStorage.setItem("userinfo", JSON.stringify(userInfo))
        }

        return true
      }
    } catch (error) {
      // 刷新失败，清除用户信息并跳转到登录页
      removeUserInfo()
      history.replace(redirectLoginPath)
      throw error
    }
  }

  return false
}

export const request = async (
  url: string,
  params: Record<string, any> = {},
  extParams: Partial<PassExtParamsDescriptorMore> = {},
  ctx?: any,
) => {
  let headers: Partial<RequestHeaderInfo> = {}

  const rawUrl = url
  const gateway = extParams?.gateway || "/api/"
  url =
    process.env.NODE_ENV === "development"
      ? gateway + rawUrl
      : (process.env.BUILD_ENV && proxy[process.env.BUILD_ENV][gateway].target) + rawUrl

  // 检查并刷新token（排除刷新token接口本身）
  if (
    rawUrl !== "admin/refreshToken" &&
    rawUrl !== "system/config" &&
    !extParams?.gateway
  ) {
    const now = Date.now()
    // 添加防抖机制，避免频繁调用刷新token
    if (now - lastRefreshTime > REFRESH_DEBOUNCE_TIME) {
      await checkAndRefreshToken()
      lastRefreshTime = now
    }
  }

  const prepareEnv = () => {
    if (typeof document !== "undefined") {
      headers = {
        "Content-Type": extParams["Content-Type"] ?? "application/json",
        "Accept-Language": getRuntimeLocale(),
        "X-App-Language": getRuntimeLocale(),
      }
    }

    // 对于不需要认证的接口（如/system/config），不添加Authorization头
    if (rawUrl !== "system/config" && !url.endsWith("/system/config")) {
      headers.Authorization =
        "Bearer " +
        (extParams?.gateway && process.env.BUILD_ENV
          ? proxy[process.env.BUILD_ENV][gateway].token
          : localStorage.getItem(ACCESS_TOKEN))
    }
  }

  prepareEnv()

  let { _method = "GET", _gateway, _description = "" } = extParams

  if (extParams.method) {
    _method = extParams.method.toUpperCase()
  }

  const startTime = Date.now()

  let passData = params as any

  if (_method === "POST") {
    // post && form 需要 querystring
    const tar = headers["Content-Type"] as any
    if (typeof tar !== "boolean" && tar.includes("form-urlencoded")) {
      passData = qs.stringify(params, { arrayFormat: "brackets" })
    } else if (typeof tar !== "boolean" && tar.includes("multipart/form-data")) {
      let formData = new FormData()
      Object.keys(passData).forEach((item) => {
        formData.append(String(item), passData[item])
      })
      passData = formData
    }
  }

  //   `%c 请求开始：${_method || "GET"}`,
  //   "background-color: #f25c62; color: #fff; font-size: 12px; font-weight: bold",
  //   `--> ${url} `,
  //   `header => `,
  //   headers,
  //   `data => `,
  //   passData,
  // )

  const axiosInfo: AxiosRequestConfig = {
    url,
    method: _method,
    headers,
    [_method === "GET" ? "params" : "data"]: passData,
    signal: controller.signal,
  } as AxiosRequestConfig

  if (extParams.responseType) {
    axiosInfo.responseType = extParams.responseType
  }

  if (typeof document !== "undefined") {
    if (extParams.showLoading) {
      message.loading(formatRuntimeMessage("app.common.requesting", "Loading..."), 0)
    }
  }

  const res = await axios(axiosInfo).catch(async (err: AxiosError) => {
    // http 层面异常

    if (typeof document !== "undefined") {
      if (err?.response?.status == 401) {
        controller.abort()

        controller = new AbortController()
      }

      extParams.showLoading && message.destroy()

      let errorInfo =
        err?.response?.status == 401
          ? formatRuntimeMessage("app.common.tokenExpired", "Token expired. Please sign in again.")
          : err?.response?.statusText
          ? err?.response?.statusText
          : formatRuntimeMessage("app.common.serviceError", "Service error")

      if (err.name != "CanceledError") {
        extParams.showToast && message.error(errorInfo)
      }

      if (err?.response?.status == 401) {
        // 如果是refreshToken接口本身返回401，直接退出登录，避免无限循环
        if (url === "/api/admin/refreshToken" || url.includes("admin/refreshToken")) {
          setTimeout(() => {
            removeUserInfo()
            history.replace(redirectLoginPath)
          }, 300)
          throw new Error("Refresh token failed")
        }

        // 先尝试刷新token
        try {
          const res = await refreshToken({ showToast: false })

          // refreshToken API 返回标准格式 {err, msg, res}
          if (res && res.err === 0 && res.res) {
            const jwtToken = res.res
            // 更新本地存储的token信息
            localStorage.setItem(ACCESS_TOKEN, jwtToken.access_token)
            localStorage.setItem(ACCESS_TOKEN_EXPIRE, jwtToken.access_expire.toString())
            localStorage.setItem(REFRESH_AFTER, jwtToken.refresh_after.toString())

            // 更新USER_INFO中的jwtToken
            const userInfoStr = localStorage.getItem("userinfo")
            if (userInfoStr) {
              const userInfo = JSON.parse(userInfoStr)
              userInfo.jwtToken = jwtToken
              localStorage.setItem("userinfo", JSON.stringify(userInfo))
            }

            // 刷新成功后重新发送原始请求
            return request(rawUrl, params, extParams, ctx)
          }
        } catch (refreshError) {
          // 刷新失败，清除用户信息并跳转到登录页
          setTimeout(() => {
            removeUserInfo()
            history.replace(redirectLoginPath)
          }, 300)
        }
      }

      extParams.finallyCallback?.()
    }
    throw JSON.stringify(err.response || err.request || err.message)
  })

  const stream = {
    name: "",
    desc: _description || "",
    gateway: _gateway,
    url,
    headers,
    method: _method as any,
    requestParams: params,
    responseData: { status: res?.status, headers: res?.headers, data: res.data },
    time: `${(Date.now() - startTime).toFixed(2)} ms`,
  }

  if (typeof document !== "undefined") {
    extParams.showLoading && message.destroy()
  }

  if (res.status >= 200 && res.status < 300) {
    // 业务内的各种状态
    const info = res.data as any

    if (info) {
      if (info.err == 0) {
        return info
      }

      if (extParams.needError) {
        return info
      }

      if (extParams.responseType == "blob") {
        if (info.type == "application/json") {
          const fileReader = new FileReader()
          fileReader.onloadend = () => {
            const csv: string | ArrayBuffer = fileReader.result || ""

            if (typeof csv === "string") {
              const jsonData = JSON.parse(csv)
              extParams.showToast &&
                message.error(formatApiResponseMessage(jsonData, jsonData.msg))
            }
          }
          fileReader.readAsText(info)
          return
        }
        return info
      }
    }

    if (typeof document !== "undefined") {
      extParams.showLoading && message.destroy()
      let errorInfo = formatApiResponseMessage(
        info,
        formatRuntimeMessage("app.common.unknownError", "Unknown error"),
      )
      extParams.showToast && message.error(errorInfo)

      if (info.err == -999999) {
        setTimeout(() => {
          removeUserInfo()

          const { search, pathname } = window.location

          history.replace({
            pathname: LOGINPATH,
            search: stringify({
              redirect: pathname + search,
            }),
          })
        }, 300)
      }

      extParams.finallyCallback?.()
    }
  }
  throw res?.data || formatRuntimeMessage("app.common.unknownError", "Unknown error")
}

const resolveApi = (tag: string) => {
  return async (
    url: string,
    params: Record<string, any> = {},
    extParams: PassExtParamsDescriptor = {},
    ctx?: any,
  ): Promise<any> => {
    const info = await request(
      url,
      params,
      {
        ...extParams,
        method: tag.toUpperCase(),
      },
      ctx,
    ).catch((_err: any) => {
      //
      throw _err
    })
    return info
  }
}

export const getApi = resolveApi("get")
export const postApi = resolveApi("post")
export const putApi = resolveApi("put")
export const deleteApi = resolveApi("delete")
export const patchApi = resolveApi("patch")

export default {
  request,
  getApi,
  postApi,
  putApi,
  deleteApi,
  patchApi,
}

/**
 * @module 业务辅助
 */
import { ACCESS_TOKEN, USER_INFO } from "@/constants"

// 清理用户转态
// 退出登录
export const removeUserInfo = () => {
  localStorage.removeItem(ACCESS_TOKEN)
  localStorage.removeItem(USER_INFO)
}

// 获取用户信息
export const getUserInfo = () => {
  return new Promise((resolve) => {
    const userInfo: Partial<API_USER.Res> = JSON.parse(localStorage.getItem(USER_INFO) || "{}")
    resolve(userInfo)
  })
}

/**
 * @module 业务辅助
 */
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, REFRESH_AFTER, USER_INFO } from "@/constants"

// 清理用户转态
// 退出登录
export const removeUserInfo = () => {
  localStorage.removeItem(ACCESS_TOKEN)
  localStorage.removeItem(ACCESS_TOKEN_EXPIRE)
  localStorage.removeItem(REFRESH_AFTER)
  localStorage.removeItem(USER_INFO)
}

// 获取用户信息
export const getUserInfo = () => {
  return new Promise((resolve) => {
    const userInfo: Partial<API_USER.Res> = JSON.parse(localStorage.getItem(USER_INFO) || "{}")
    resolve(userInfo)
  })
}

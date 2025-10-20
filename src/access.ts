/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API_USER.IApiPostLogin } | undefined) {
  const { currentUser } = initialState ?? {}
  return {
    // 只有角色为admin的用户才能访问用户管理页面
    canAccessAdmin: () => currentUser && currentUser.role === "admin",
    adminRouteFilter: () => currentUser && currentUser.role === "admin",
    normalRouteFilter: () => currentUser && currentUser.role !== "admin",
  }
}

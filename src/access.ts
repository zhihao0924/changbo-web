/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API_USER.Result.res } | undefined) {
  const { currentUser } = initialState ?? {}
  return {
    // 只有角色为admin的用户才能访问用户管理页面
    adminRouteFilter: () => currentUser && currentUser.role === "admin",
    normalRouteFilter: () => currentUser && currentUser.role !== "admin",
    superAdminRouteFilter: () => currentUser && currentUser.account === "admin",
  }
}

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API_USER.IApiPostLogin } | undefined) {
  const { currentUser } = initialState ?? {}
  return {
    adminRouteFilter: () => currentUser && currentUser.access === "admin",
    normalRouteFilter: () => currentUser && currentUser.access !== "admin",
  }
}

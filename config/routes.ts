const baseFeatureConfig = require(`${process.cwd()}/config/baseFeature`)

type AppRoute = {
  name?: string
  path?: string
  layout?: boolean
  component?: string
  icon?: string
  redirect?: string
  access?: string
  hideInMenu?: boolean
  routes?: AppRoute[]
}

type MenuKey =
  | "dashboard"
  | "device.status"
  | "device.index"
  | "device.libiioBoard"
  | "device.libiio"
  | "device.libiioConfig"
  | "device.types"
  | "device.logs"
  | "device.xlsx"
  | "admin"
  | "setting"

const isBaseFeatureSet = process.env.FEATURE_SET === "base"
const baseMenuSet = new Set<string>(baseFeatureConfig.menus)

const enabledInBase = (key: MenuKey) => !isBaseFeatureSet || baseMenuSet.has(key)
const allEnabledInBase = (...keys: MenuKey[]) => keys.some((key) => enabledInBase(key))
const firstEnabledPath = (featureRoutes: AppRoute[], fallback: string) => {
  const firstRoute = featureRoutes.find((route) => route.name || route.path === "/device")

  if (firstRoute?.path === "/device") {
    return firstRoute.routes?.[0]?.path || fallback
  }

  return firstRoute?.path || fallback
}

const publicRoutes: AppRoute[] = [
  {
    path: "/user",
    layout: false,
    routes: [
      {
        name: "login",
        path: "/user/login",
        component: "./user/login",
      },
      {
        component: "./404",
      },
    ],
  },
  {
    path: "/callback",
    layout: false,
    component: "./user/callback",
  },
]

const deviceChildRoutes: Array<AppRoute & { menuKey?: MenuKey }> = [
  {
    menuKey: "device.status",
    name: "status",
    path: "/device/status",
    component: "./device/status",
  },
  {
    menuKey: "device.index",
    path: "/device",
    redirect: "/device/index",
    access: "adminRouteFilter",
  },
  {
    menuKey: "device.index",
    name: "list",
    path: "/device/index",
    component: "./device/index",
    access: "adminRouteFilter",
  },
  {
    menuKey: "device.libiioBoard",
    name: "libiioBoard",
    path: "/device/libiio-board",
    component: "./device/libiio/board",
    access: "superAdminRouteFilter",
  },
  {
    menuKey: "device.libiio",
    name: "libiio",
    path: "/device/libiio",
    component: "./device/libiio",
    access: "superAdminRouteFilter",
  },
  {
    menuKey: "device.libiioConfig",
    name: "libiioConfig",
    path: "/device/libiio/config/:deviceId",
    component: "./device/libiio/config",
    access: "superAdminRouteFilter",
    hideInMenu: true,
  },
  {
    menuKey: "device.types",
    name: "types",
    path: "/device/types",
    component: "./device/types",
    access: "adminRouteFilter",
  },
  {
    menuKey: "device.logs",
    name: "logs",
    path: "/device/log",
    component: "./device/log",
  },
  {
    menuKey: "device.xlsx",
    name: "xlsx",
    path: "/device/dailyXlsx",
    component: "./device/dailyXlsx",
  },
]

const enabledDeviceChildRoutes = deviceChildRoutes
  .filter((route) => !route.menuKey || enabledInBase(route.menuKey))
  .map(({ menuKey, ...route }) => route)

const featureRoutes: AppRoute[] = [
  ...(enabledInBase("dashboard")
    ? [
        {
          name: "dashboard",
          path: "/dashboard",
          component: "./dashboard",
          icon: "barChart",
        },
      ]
    : []),
  ...(allEnabledInBase(
    "device.status",
    "device.index",
    "device.libiioBoard",
    "device.libiio",
    "device.libiioConfig",
    "device.types",
    "device.logs",
    "device.xlsx",
  )
    ? [
        {
          name: "device",
          path: "/device",
          icon: "hdd",
          routes: enabledDeviceChildRoutes,
        },
      ]
    : []),
  ...(enabledInBase("admin")
    ? [
        {
          name: "admin",
          path: "/admin",
          icon: "user",
          access: "adminRouteFilter",
          routes: [
            {
              path: "/admin",
              redirect: "/admin/list",
            },
            {
              name: "list",
              path: "/admin/list",
              component: "./admin/list",
            },
          ],
        },
      ]
    : []),
  ...(enabledInBase("setting")
    ? [
        {
          name: "setting",
          path: "setting",
          icon: "setting",
          access: "superAdminRouteFilter",
          component: "./setting/system",
        },
      ]
    : []),
]

const routes: AppRoute[] = [
  ...publicRoutes,
  ...featureRoutes,
  {
    path: "/",
    redirect: firstEnabledPath(featureRoutes, "/dashboard"),
  },
  {
    component: "./404",
  },
]

export default routes

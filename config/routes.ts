export default [
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
  {
    name: "dashboard",
    path: "/dashboard",
    component: "./dashboard",
    icon: "barChart",
  },
  {
    name: "device",
    path: "/device",
    icon: "hdd",
    routes: [
      {
        path: "/device",
        redirect: "/device/index",
      },
      {
        name: "list",
        path: "/device/index",
        component: "./device/index",
      },
      {
        name: "types",
        path: "/device/types",
        component: "./device/types",
      },
      {
        name: "status",
        path: "/device/status",
        component: "./device/status",
      },
      {
        name: "logs",
        path: "/device/log",
        component: "./device/log",
      },
    ],
  },

  {
    name: "admin",
    path: "/admin",
    icon: "user",
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
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    component: "./404",
  },
]

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
    name: "device",
    path: "/device",
    // icon: "shoppingCart",
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
    ],
  },
  {
    path: "/",
    redirect: "/device/index",
  },
  {
    component: "./404",
  },
]

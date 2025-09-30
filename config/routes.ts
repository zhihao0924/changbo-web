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
    icon: "shoppingCart",
    routes: [
      {
        path: "/device",
        redirect: "/device/index",
      },
      {
        name: "index",
        icon: "smile",
        path: "/device/index",
        component: "./device/index",
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

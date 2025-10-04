export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login'
      },
      {
        component: './404'
      }
    ]
  },
  {
    path: '/callback',
    layout: false,
    component: './user/callback'
  },
  {
    name: 'device',
    path: '/device',
    icon: 'shoppingCart',
    routes: [
      {
        path: '/device',
        redirect: '/device/index'
      },
      {
        name: '设备列表',
        path: '/device/index',
        component: './device/index'
      },
      {
        name: '设备类型',
        path: '/device/types',
        component: './device/types'
      },
      {
        name: '设备状态',
        path: '/device/status',
        component: './device/status'
      },
      {
        name: '设备拓普图',
        path: '/device/topology',
        component: './device/topology'
      }
    ]
  },
  {
    path: '/',
    redirect: '/device/index'
  },
  {
    component: './404'
  }
]

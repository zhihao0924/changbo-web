// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

const RouteView = {
  name: 'RouteView',
  render: h => h('router-view')
}

export const asyncRouterMap = [
  {
    path: '/user',
    name: 'user',
    component: UserLayout,
    meta: { title: '用户' },
    redirect: '/user/login',
    children: [
      {
        path: '/user/login',
        name: 'Login',
        component: () => import('@/views/user/Login'),
        meta: { title: '登录' }
      }
    ]
  },
  {
    path: '/',
    name: '工作台',
    component: BasicLayout,
    meta: { title: '工作台' },
    redirect: '/dashboard',
    children: [
      // dashboard
      {
        path: '/dashboard',
        name: '工作台',
        meta: { title: '工作台', keepAlive: true, icon: bxAnaalyse },
        component: () => import('@/views/dashboard/Workplace')
      },
      // 设备
      {
        path: '/device',
        name: '设备列表',
        component: RouteView,
        meta: { title: '设备列表', keepAlive: true, icon: 'table' },
        redirect: '/device/list',
        children: [
          {
            path: '/device/list',
            name: '设备列表',
            component: () => import('@/views/device/List'),
            meta: { title: '设备列表', keepAlive: true }
          }
        ]
      }
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'user/login',
        name: 'user/login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]

import Vue from 'vue'
import Router from 'vue-router'
import { constantRouterMap, asyncRouterMap } from '@/config/router.config'

Vue.use(Router)

const router = new Router({
  mode: 'hash', // 临时切换为 hash 模式
  routes: constantRouterMap.concat(asyncRouterMap)
})

console.log('路由实例已创建，模式为:', router.mode)

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 直接从 localStorage 读取 token，确保与 Vuex 同步
  const token = localStorage.getItem('Access-Token')
  console.log('token 状态:', token, 'to :', to, 'form:', from)
  if (!token && !to.fullPath.includes('user/login')) {
    console.log('未登录，跳转到登录页面')
    next('/user/login') // 重定向到登录页面
  } else if (token && to.fullPath === '/user/login') {
    console.log('已登录，跳转到工作台')
    next('/dashboard/workplace') // 登录成功后跳转到工作台
  } else {
    next()
  }
})

export default router

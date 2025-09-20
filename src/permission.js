import router from './router'
import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import store from '@/store'

NProgress.configure({ showSpinner: false }) // NProgress Configuration// no redirect allowList
const loginRoutePath = '/user/login'
const defaultRoutePath = '/dashboard/workplace'
router.beforeEach((to, from, next) => {
  NProgress.start() // 开始进度条
  // 设置页面标题（如果路由meta中有定义title）
  to.meta && typeof to.meta.title !== 'undefined' && setDocumentTitle(`${to.meta.title} - ${domTitle}`)

  const token = storage.get(ACCESS_TOKEN) // 从本地存储获取token
  if (token) { // 已登录状态
    if (to.path === loginRoutePath) { // 如果目标路由是登录页，则重定向到默认页
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      // 确保路由数据加载完成后再进入页面
      store.dispatch('GenerateRoutes', { token }).then(() => {
        next()
      }).catch(() => {
        next({ path: loginRoutePath })
      })
    }
  } else { // 未登录状态
    if (to.path === loginRoutePath) { // 如果目标路由是登录页，则直接放行
      next()
    } else {
      next({ path: loginRoutePath, query: { redirect: to.fullPath } }) // 不在则跳转登录页
    }
    NProgress.done()
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

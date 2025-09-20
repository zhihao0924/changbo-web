import { constantRouterMap } from '@/config/router.config'

const permission = {
  state: {
    routers: constantRouterMap
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.routers = constantRouterMap
    }
  },
  actions: {
    GenerateRoutes ({ commit }) {
      return new Promise(resolve => {
        commit('SET_ROUTERS', [])
        resolve()
      })
    }
  }
}

export default permission

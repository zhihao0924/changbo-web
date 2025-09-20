import storage from 'store'
import expirePlugin from 'store/plugins/expire'
import { login, logout } from '@/api/login'
import { ACCESS_TOKEN, ADMIN_NAME } from '@/store/mutation-types'

storage.addPlugin(expirePlugin)
const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          storage.set(ACCESS_TOKEN, response.jwt_token.access_token, new Date().getTime() + response.jwt_token.access_expire * 1000)
          storage.set(ADMIN_NAME, response.username, new Date().getTime() + response.jwt_token.access_expire * 1000)
          commit('SET_TOKEN', response.jwt_token.access_token)
          commit('SET_NAME', response.username)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          storage.remove(ACCESS_TOKEN)
          resolve()
        }).catch((err) => {
          console.log('logout fail:', err)
          // resolve()
        }).finally(() => {
        })
      })
    }

  }
}

export default user

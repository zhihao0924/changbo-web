import request from '@/utils/request'

const api = {
  deviceList: '/device/list',
  deviceSave: '/device/save'
}

export default api

export function postDeviceList (parameter) {
  return request({
    url: api.deviceList,
    method: 'post',
    data: parameter
  })
}

export function postDeviceSave (parameter) {
  return request({
    url: api.deviceSave,
    method: 'post',
    data: parameter
  })
}

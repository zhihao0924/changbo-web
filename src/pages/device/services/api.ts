import { postApi } from "@/utils/request"

// 订单列表
export async function postDeviceList(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostDeviceList.Result = await postApi(
    "device/list",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })

  return res
}

// 新增设备
export async function postDeviceSave(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostDeviceCreate.Result = await postApi(
    "device/save",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })

  return res
}

export async function postToggleMaintaining(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostToggleMaintaining.Result = await postApi(
    "device/toggleMaintaining",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })

  return res
}

// 获取设备类型
export async function postDeviceTypes(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostDeviceTypes.Result = await postApi(
    "device/types",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

// 获取设备类型
export async function postDeviceTypeSave(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostDeviceTypes.Result = await postApi(
    "device/typeSave",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

export async function postTopologyData(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostTopologyData.Result = await postApi(
    "topology/getData",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

export async function postSaveTopologyData(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostSaveTopologyData.Result = await postApi(
    "topology/saveData",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

export async function postDeviceTypeConfigSave(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostDeviceTypeConfigSaveData.Result = await postApi(
    "device/typeConfigSave",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

export async function postDeviceLogList(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostLogList.Result = await postApi(
    "device/logList",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

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
export async function postDeviceCreate(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostDeviceCreate.Result = await postApi(
    "device/create",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })

  return res
}

export async function postDeviceUpdate(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostDeviceUpdate.Result = await postApi(
    "device/update",
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

import { postApi } from "@/utils/request"

export async function postAdminList(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostAdminList.Result = await postApi(
    "admin/list",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

export async function postAdminCreate(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostAdminCreate.Result = await postApi(
    "admin/create",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

export async function postAdminResetPwd(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostAdminResetPwd.Result = await postApi(
    "admin/resetPassword",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

export async function postDisableAdmin(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostAdminCreate.Result = await postApi(
    "admin/disable",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

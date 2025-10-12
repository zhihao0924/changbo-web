import { postApi } from "@/utils/request"

export async function logIn(obj: Record<string, any>, extParams?: PassExtParamsDescriptorMore) {
  const res: API_USER.Result = await postApi(
    "admin/login",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })

  return res
}

export async function changePassword(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostChangePassword.Result = await postApi(
    "admin/changePassword",
    { ...obj },
    {
      showLoading: true,
      showToast: true,
      ...extParams,
    },
  ).catch((err) => {
    console.error(err)
    throw err
  })

  return res
}

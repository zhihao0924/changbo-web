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

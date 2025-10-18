import { postApi } from "@/utils/request"
import { ACCESS_TOKEN } from "@/constants"

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

export async function refreshToken(extParams?: PassExtParamsDescriptorMore) {
  const accessToken = localStorage.getItem(ACCESS_TOKEN)
  
  try {
    const res: API_RefreshToken.Result = await postApi(
      "admin/refreshToken",
      {
        token: accessToken
      },
      {
        showLoading: false,
        showToast: false,
        ...extParams,
      },
    )
    return res
  } catch (error) {
    console.error('Refresh token API error:', error)
    throw error
  }
}

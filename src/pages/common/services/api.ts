import { postApi } from "@/utils/request"

// 上传图片
export async function postDeviceSelectOptions(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostDeviceSelectOptions.Result = await postApi(
    "device/selectOptions",
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

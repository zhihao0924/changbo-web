import { postApi } from "@/utils/request"

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
    throw err
  })

  return res
}

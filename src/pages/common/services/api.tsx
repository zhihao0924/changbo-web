import { postApi } from "@/utils/request"

// 上传图片
export async function postUploadImage(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostUploadImage.Result = await postApi(
    "api/upload",
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


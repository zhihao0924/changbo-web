import { postApi } from "@/utils/request"

export async function postDashboardData(
  obj: Record<string, any>,
  extParams?: PassExtParamsDescriptorMore,
) {
  const res: API_PostDashboard.Result = await postApi(
    "dashboard/index",
    { ...obj },
    { showLoading: true, showToast: true, ...extParams },
  ).catch((err) => {
    console.error(err)
    throw err
  })
  return res
}

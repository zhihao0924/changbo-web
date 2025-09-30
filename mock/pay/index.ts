import { request } from "umi"
import type { FakeLists } from "./typings/data.d"

type ParamsType = {
  count?: number
} & Partial<FakeLists>

export async function queryFakeList(params: ParamsType): Promise<{ res: { list: FakeLists[] } }> {
  return request("/fake/get_list", {
    params,
  })
}

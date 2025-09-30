import type { Request, Response } from "express"
import type { FakeLists } from "./typings/data.d"

const statusList = [0, 1, 2]
const isSuccess = [true, false]

function fakeList(count: number): FakeLists[] {
  const list = []
  for (let i = 0; i < count; i += 1) {
    list.push({
      id: i,
      createStart: "2022-07-25 12:21:33",
      price: "￥650",
      payPrice: "￥550",
      status: statusList[i % 3],
      statusChangeTime: isSuccess ? "2022-08-08 12:00:00" : "",
      grouperId: 167708,
      grouperName: "蜘蛛侠",
      company: 8,
      companyName: "玉皇大帝组",
      orderId: 988267,
      orderTitle: "8月海南02车",
      receiverName: "钢铁侠",
      receiverPhone: "13917782910",
      operator: "19999999999",
      isSuccess: statusList[i % 3] == 0 ? false : isSuccess[i % 2],
    })
  }

  return list
}

function getFakeList(req: Request, res: Response) {
  const params = req.query as any

  const count = Number(params.count) * 1 || 20

  const result = fakeList(count)

  return res.json({
    res: {
      list: result,
    },
  })
}

export default {
  "GET  /fake/get_list": getFakeList,
}

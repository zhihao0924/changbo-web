import BigNumber from "bignumber.js"

// 分 => 元
export const formatPrice = (value: any) => {
  if (value == 0) return Number("0.00")
  if (!value) return null
  return Number(BigNumber(value).div(100))
}

// 负数拆分
export const negativePrice = (value: any) => {
  let amount = {
    flag: "",
    value: 0,
  }
  amount = value.toString().startsWith("-")
    ? {
        flag: "-",
        value: value.toString().split("-")[1] * 1,
      }
    : {
        flag: "",
        value,
      }
  return amount
}

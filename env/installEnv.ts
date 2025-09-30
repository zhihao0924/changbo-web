/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */

import * as dotenv from "dotenv"
import * as fs from "fs-extra"
import * as path from "path"

const DEBUG = process.env.DEBUG || false

const envRoot = path.join(process.cwd(), "env")
const envLocalFile = path.resolve(envRoot, ".env.local")

export default (obj: any) => {
  //首先载入当前目录下.env环境变量
  dotenv.config({ path: path.resolve(envRoot, ".env"), override: true, debug: Boolean(DEBUG) })

  if (process.env.NODE_ENV === "development" && !fs.existsSync(envLocalFile)) {
    // 不存在本地文件
    console.error("⚠️ Please check your env/.env.local file")
    process.exit(-1)
  }

  if (process.env.NODE_ENV === "development") {
    // 开发环境
    dotenv.config({
      path: path.resolve(envRoot, ".env.development"),
      override: true,
      debug: Boolean(DEBUG),
    })
    dotenv.config({ path: envLocalFile, override: true, debug: Boolean(DEBUG) })
  } else {
    // 生产环境
    // const env = obj?.SCRIPT.split(":")[1] || 'prod'
    dotenv.config({
      path: path.resolve(envRoot, `.env.production`),
      override: true,
      debug: Boolean(DEBUG),
    })
  }

  if (obj) {
    const keyArr = Object.keys(obj)
    if (keyArr.length) {
      keyArr.forEach((item) => {
        if (item && typeof obj[item] !== "undefined") {
          process.env[item] = obj[item]
        }
      })
    }
  }

  if (process.env.DEPLOY_ENV) {
    //
  } else {
    console.error("⚠️  process.env.DEPLOY_ENV undefined")
  }
}

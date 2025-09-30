/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { RcFile } from "antd/es/upload"
import type { UploadRequestOption } from "rc-upload/lib/interface"
import Services from "@/pages/common/services"

interface UploadType extends UploadRequestOption {
  id?: number
  type?: string
}

export const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

export const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

export const stringToBoolean = (stringValue: any) => {
  switch (stringValue?.toLowerCase()?.trim()) {
    case "true":
    case "yes":
    case "1":
      return true

    case "false":
    case "no":
    case "0":
    case null:
    case undefined:
      return false

    default:
      return JSON.parse(stringValue)
  }
}

/** 将数据保存为csv格式 */
export const saveAs = (_href: string | Blob, _fileName?: string, toBlob?: any) => {
  let fileName = _fileName,
    href = _href
  const isBlob = href instanceof Blob || toBlob
  if (!fileName && typeof href === "string" && href.startsWith("http")) {
    fileName = href.slice(href.lastIndexOf("/") + 1)
  }
  fileName = decodeURIComponent(fileName || "download")
  if (typeof href === "string" && toBlob) href = new Blob([href], toBlob)
  if (href instanceof Blob) href = URL.createObjectURL(href)
  const aLink = document.createElement("a")
  aLink.setAttribute("href", href)
  aLink.setAttribute("download", fileName)
  aLink.click()
  if (isBlob) setTimeout(() => URL.revokeObjectURL(aLink.href), 100)
  return aLink
}

export const uploadImage = async (options: UploadType, cb: (str: any) => void) => {
  const { file, type } = options
  if (file) {
    const ext = (file as RcFile)?.name?.split(".").pop()

    if (!ext) return

    const res = await Services.api.postUploadImage(
      {
        file,
        type,
      },
      {
        "Content-Type": `multipart/form-data;boundary=-----7d4a6d158c9`,
      },
    )

    cb(res?.res || null)
  }
}

// 获取文件后缀类型
export const fileExtension = (filePath: string) => {
  const index = filePath.lastIndexOf(".")
  const type = filePath.slice(index + 1)
  return type.toLowerCase()
}
// 是否为图片
export const isImage = (filePath: string) => {
  const types = ["png", "jpg", "jpeg", "bmp", "gif", "webp", "psd", "svg", "tiff"]
  const type = fileExtension(filePath)
  return types.indexOf(type) !== -1
}
// 是否为视频
export const isVideo = (filePath: string) => {
  const types = [
    "avi",
    "wmv",
    "mpg",
    "mpeg",
    "mov",
    "rm",
    "ram",
    "swf",
    "flv",
    "mp4",
    "mp3",
    "wma",
    "avi",
    "rm",
    "rmvb",
    "flv",
    "mpg",
    "mkv",
  ]
  const type = fileExtension(filePath)
  return types.indexOf(type) !== -1
}

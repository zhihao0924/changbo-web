/* eslint-disable @typescript-eslint/no-unused-vars */
type DEPLOY_ENV = "dev" | "staging" | "prod"
type NODE_ENV = "development" | "production"
type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type NETWORK = "inner" | "outer" | "office"
type ContentType = "application/json" | "application/x-www-form-urlencoded"
type ResponseType = "arraybuffer" | "blob" | "document" | "json" | "text" | "stream"

declare module "slash2"
declare module "*.css"
declare module "*.module.less" {
  const content: Record<string, string>
  export = content
  declare module "*.less"
}

declare module "*.scss"
declare module "*.sass"
declare module "*.svg"
declare module "*.png"
declare module "*.jpg"
declare module "*.jpeg"
declare module "*.gif"
declare module "*.bmp"
declare module "*.tiff"
declare module "omit.js"
declare module "numeral"
declare module "@antv/data-set"
declare module "mockjs"
declare module "react-fittext"
declare module "bizcharts-plugin-slider"

// preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design Dedicated environment variable, please do not use it in your project.
declare let ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: "site" | undefined

declare global {
  interface Window {
    DEPLOY_ENV: DEPLOY_ENV
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any
    __REDUX_DEVTOOLS_EXTENSION__: any
    _za: any
    $: any
    _zax: any
    tns: any
    Odometer: any
    location: Location
    VConsole: any
    _bd_share_main: any
    QRLogin: any
    attachEvent: any
  }

  type Cookie = {
    domain?: string
    encode?: (val: string) => string
    expires?: Date
    httpOnly?: boolean
    maxAge?: number
    path?: string
    secure?: boolean
    signed?: boolean
    sameSite?: boolean | string
  }

  type Pager<T> = {
    data: Pick<T, any>
    total: Pick<T, any>
    success: boolean
  }

  type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
    ...args: any
  ) => Promise<infer R>
    ? R
    : any

  interface PassExtParamsDescriptor {
    showLoading?: boolean
    showToast?: boolean
    description?: string
    finallyCallback?: (...args: any[]) => any

    [k: string]: any
  }

  interface RequestHeaderInfo {
    "Content-Type": ContentType
    // accessKey?: string
    // encOpenId?: string
    // openId?: string
    // t?: string
    // channel?: number
    // bizOrigin?: string
    [k: string]: any
  }

  interface PassExtParamsDescriptorMore extends PassExtParamsDescriptor {
    _method?: Method
    _description?: string
    fullResponse?: boolean
    [k: string]: any
    responseType?: ResponseType
  }

  namespace NodeJS {
    interface ProcessEnv {
      BUILD_TIME: string
      APP_NAME: "lefox-operation" | "lefox-shopping"
      NODE_ENV: NODE_ENV
      DEPLOY_ENV: DEPLOY_ENV
      NETWORK: NETWORK
      DEVELOPER: string
      STATIC_PREFIX: string
      DEBUG: boolean
      HOST: string
      PORT: string
      MOCK_PORT: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}

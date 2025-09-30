import dayjs from "dayjs"
import { defineConfig } from "umi"
import installEnv from "../env/installEnv"
import defaultSettings from "./defaultSettings"
import proxy from "./proxy"
import routes from "./routes"

const BUILD_TIME = dayjs().format("YYYY-MM-DD HH:mm:ss")

installEnv({
  BUILD_TIME,
  SCRIPT: process.env.npm_lifecycle_event,
})

export default defineConfig({
  hash: true,
  // metas: [
  //   {
  //     "http-equiv": "Content-Security-Policy",
  //     content: "upgrade-insecure-requests",
  //   },
  // ],
  antd: {},
  define: {
    "process.env.BUILD_TIME": process.env.BUILD_TIME,
    "process.env.DEPLOY_ENV": process.env.DEPLOY_ENV,
    "process.env.DEVELOPER": process.env.DEVELOPER,
    "process.env.BUILD_ENV": process.env.BUILD_ENV,
  },
  theme: {
    "@primary-color": defaultSettings.colorPrimary, // 全局主色
    "@link-color": defaultSettings.colorPrimary, // 链接色
    "@menu-dark-submenu-bg": "#000c17",
    "@success-color": "#52c41a", // 成功色
    "@warning-color": "#faad14", // 警告色
    "@error-color": "#f5222d", // 错误色
    "@font-size-base": "14px", // 主字号
    "@heading-color": "rgba(0, 0, 0, 0.85)", // 标题色
    "@text-color": "rgba(0, 0, 0, 0.65)", // 主文本色
    "@text-color-secondary": "rgba(0, 0, 0, 0.45)", // 次文本色
    "@disabled-color": "rgba(0, 0, 0, 0.25)", // 失效色
    "@border-radius-base": "4px", // 组件、浮层圆角
    "@border-color-base": "#d9d9d9", // 边框色
    "@box-shadow-base":
      "0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)", // 浮层阴影
  },
  lessLoader: {
    modifyVars: {
      hack: 'true; @import "/src/mixin.less";',
    },
  },
  headScripts: [
    "https://sf3-cn.feishucdn.com/obj/feishu-static/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.2.js",
  ],
  locale: {
    default: "zh-CN",
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: false,
  },
  layout: {
    locale: true,
    siderWidth: 208,
    headerRender: true,
    ...defaultSettings,
  },
  routes,
  alias: {
    "@": "/src",
    mock: "/mock",
    config: "/config",
  },
  proxy: proxy[process.env.DEPLOY_ENV || "dev"],
  mfsu: {},
  webpack5: {},
  exportStatic: {},
})

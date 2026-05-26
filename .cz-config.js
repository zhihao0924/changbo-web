// Standalone cz-customizable config. Commitizen and cz-customizable are installed
// globally; .czrc points Commitizen to the global adapter without package.json config.
const typeChoices = [
  { value: "feat", name: "feat:     新增功能" },
  { value: "fix", name: "fix:      修复缺陷" },
  { value: "perf", name: "perf:     性能或用户体验优化" },
  { value: "refactor", name: "refactor: 重构代码，不改变功能行为" },
  { value: "style", name: "style:    代码格式、样式格式调整" },
  { value: "docs", name: "docs:     文档或注释更新" },
  { value: "test", name: "test:     测试用例或测试配置" },
  { value: "build", name: "build:    构建、依赖、打包配置变更" },
  { value: "ci", name: "ci:       CI/CD 或 Git hooks 变更" },
  { value: "chore", name: "chore:    工程维护、脚手架、辅助任务" },
  { value: "revert", name: "revert:   回滚提交" },
  { value: "release", name: "release:  版本发布" },
]

const pageScopes = [
  { value: "app", name: "app: 运行时、布局、全局初始化" },
  { value: "dashboard", name: "dashboard: 仪表盘" },
  { value: "device", name: "device: 设备中心通用能力" },
  { value: "device-list", name: "device-list: 设备管理" },
  { value: "device-status", name: "device-status: 设备状态/拓扑" },
  { value: "device-types", name: "device-types: 设备类型配置" },
  { value: "device-log", name: "device-log: 告警日志" },
  { value: "device-daily", name: "device-daily: 数据备份/日报" },
  { value: "libiio", name: "libiio: Libiio 设备列表" },
  { value: "libiio-board", name: "libiio-board: 频点数据看板" },
  { value: "libiio-config", name: "libiio-config: 频点配置" },
  { value: "admin", name: "admin: 用户管理" },
  { value: "setting", name: "setting: 系统设置" },
  { value: "user", name: "user: 登录、回调、用户信息" },
]

const sharedScopes = [
  { value: "components", name: "components: 公共组件" },
  { value: "services", name: "services: API 请求与接口封装" },
  { value: "api", name: "api: 接口定义、请求参数、响应处理" },
  { value: "typing", name: "typing: TypeScript 类型定义" },
  { value: "utils", name: "utils: 工具函数" },
  { value: "i18n", name: "i18n: 国际化与语言包" },
  { value: "models", name: "models: 状态模型" },
  { value: "constants", name: "constants: 常量配置" },
  { value: "access", name: "access: 权限控制" },
  { value: "styles", name: "styles: 样式与主题" },
  { value: "assets", name: "assets: 静态资源、图片、图标" },
]

const projectScopes = [
  { value: "routes", name: "routes: 路由与菜单" },
  { value: "config", name: "config: 项目配置、代理、环境配置" },
  { value: "mock", name: "mock: Mock 数据" },
  { value: "deps", name: "deps: 依赖管理" },
  { value: "build", name: "build: 构建脚本、产物配置" },
  { value: "lint", name: "lint: ESLint/Stylelint/Prettier" },
  { value: "husky", name: "husky: Git hooks" },
  { value: "release", name: "release: 版本文件与发布产物" },
]

const scopes = [...pageScopes, ...sharedScopes, ...projectScopes]

module.exports = {
  types: typeChoices,
  scopes,

  scopeOverrides: {
    build: [
      { value: "build", name: "build: 构建脚本、打包配置" },
      { value: "deps", name: "deps: 依赖管理" },
      { value: "config", name: "config: 项目配置" },
      { value: "release", name: "release: 版本文件与发布产物" },
    ],
    chore: projectScopes,
    ci: [
      { value: "ci", name: "ci: CI/CD 配置" },
      { value: "husky", name: "husky: Git hooks" },
      { value: "lint", name: "lint: ESLint/Stylelint/Prettier" },
    ],
    docs: [
      { value: "docs", name: "docs: 项目文档" },
      { value: "readme", name: "readme: README" },
      { value: "changelog", name: "changelog: 变更记录" },
    ],
    test: [
      { value: "test", name: "test: 测试用例" },
      { value: "mock", name: "mock: Mock 数据" },
    ],
  },

  allowTicketNumber: false,
  allowCustomScopes: true,
  allowBreakingChanges: ["feat", "fix", "refactor", "perf", "build"],

  subjectLimit: 72,
  subjectSeparator: ": ",
  breaklineChar: "|",
  footerPrefix: "Refs:",

  messages: {
    type: "选择提交类型：",
    scope: "选择影响范围（可选）：",
    customScope: "请输入自定义 scope，例如 page-name、component-name 或 api-name：",
    subject: "填写简短变更描述，建议用中文动词开头，例如：新增/修复/优化/调整：\n",
    body: "填写详细说明（可选，使用 | 换行）：\n",
    breaking: "列出不兼容变更（可选）：\n",
    footer: "关联 Issue/任务（可选），例如 #31、CHANGBO-123：\n",
    confirmCommit: "确认生成以上提交信息？",
  },

  skipQuestions: ["body", "footer"],
}

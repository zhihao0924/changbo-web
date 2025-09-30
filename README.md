# 畅博管理系统

## Getting Started

Install dependencies

```bash
$ yarn
```

Start the dev server

```bash
$ yarn start
```

Build production

```bash
$ yarn build:prod
$ yarn build:dev
$ yarn build:staging
```

### Tips

- 本地首次运行时，需在 env/文件夹下创建.env.local 文件，请参照.env.local.demo。
- 切换环境 or 安装依赖，重启应用后，请先使用 yarn clean，清除 umi 缓存。
- 不建议每次运行，都清空 umi 缓存，会导致 mfsu 失效，二次构建速度极慢；

## 新增功能

### Web 应用版本实时检测

第一步: 更改 package.json--version 版本号

第二步：在 src/version.json 添加版本更新内容

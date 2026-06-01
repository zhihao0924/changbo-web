module.exports = {
  // Whether to enable runtime language switching and i18n-only settings.
  i18nEnabled: true,

  // Fixed locale when i18nEnabled is false. Supported values: "en-US", "zh-CN".
  locale: "zh-CN",

  // Menu whitelist. Remove items here to exclude corresponding routes from builds.
  menus: [
    "dashboard",
    "device.status",
    "device.index",
    "device.libiioBoard",
    "device.libiio",
    "device.libiioConfig",
    "device.types",
    "device.logs",
    "device.xlsx",
    "admin",
    "setting",
  ],
}

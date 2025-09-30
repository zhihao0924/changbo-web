/*
 * @Description: eslint 配置
 * @ 规则依赖于 @umijs/fabric，在此基础上，可自行添加自己的规则进行配置
 */

module.exports = {
  extends: [require.resolve("@umijs/fabric/dist/eslint")],

  // in antd-design-pro
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },

  rules: {
    // ?  your rules
  },
}

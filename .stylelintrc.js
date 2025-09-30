const fabric = require("@umijs/fabric")

module.exports = {
  ...fabric.stylelint,
  rules: {
    "function-url-quotes": null,
    "keyframes-name-pattern": null,
    "no-empty-source": null,
    "at-rule-no-unknown": null,
    "no-descending-specificity": null,
    "selector-class-pattern": null,
    "selector-attribute-quotes": null,
    "alpha-value-notation": "number",
    "rule-empty-line-before": null,
    "color-function-notation": "legacy",
    "font-family-no-missing-generic-family-keyword": null, // iconfont
    "plugin/declaration-block-no-ignored-properties": true,
    "unit-no-unknown": [true, { ignoreUnits: ["rpx"] }],
    // // webcomponent
    "selector-type-no-unknown": null,
    "value-keyword-case": ["lower", { ignoreProperties: ["composes"] }],
    "value-no-vendor-prefix": null,
  },
  ignoreFiles: ["**/*.js", "**/*.jsx", "**/*.tsx", "**/*.ts", "**/*.md", "**/*.json"],
}

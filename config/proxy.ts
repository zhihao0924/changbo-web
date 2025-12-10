export default {
  dev: {
    "/api/": {
      target: "http://127.0.0.1:8099/",
      changeOrigin: true,
      pathRewrite: { "^": "" },
    },
  },
  prod: {
    "/api/": {
      target: "/api/",
      changeOrigin: false,
      pathRewrite: { "^": "" },
    },
  },
}

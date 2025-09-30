export default {
  dev: {
    "/api/": {
      target: "http://127.0.0.1:8080/",
      changeOrigin: true,
      pathRewrite: { "^": "" },
    },
  },
  staging: {
    "/api/": {
      target: "http://127.0.0.1:8080/",
      changeOrigin: true,
      pathRewrite: { "^": "" },
    },
  },
  prod: {
    "/api/": {
      target: "http://127.0.0.1:8080/",
      changeOrigin: true,
      pathRewrite: { "^": "" },
    },
  },
}

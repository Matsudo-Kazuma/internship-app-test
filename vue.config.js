const path = require("path")
module.exports = {
  pages: {
    index: {
      entry: "src/main.ts",
    },
  },

  configureWebpack: {
    resolve: {
      alias: {
        "@": path.join(__dirname, "/src"), // 1. @の参照先の変更
      },
    },
  },

  transpileDependencies: ["vuetify", "vuex-module-decorators"],
}

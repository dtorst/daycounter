const { defineConfig } = require('@vue/cli-service')

const isExtensionBuild = process.env.VUE_APP_BUILD_TARGET === 'extension'

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: isExtensionBuild ? './' : '/',
  productionSourceMap: !isExtensionBuild,
  configureWebpack: isExtensionBuild
    ? {
      mode: 'production',
      devtool: false
    }
    : {}
})

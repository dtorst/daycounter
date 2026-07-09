const { defineConfig } = require('@vue/cli-service')
const path = require('path')

const isExtensionBuild = process.env.VUE_APP_BUILD_TARGET === 'extension'
const isIosBuild = process.env.VUE_APP_BUILD_TARGET === 'ios'
const useRelativePublicPath = isExtensionBuild || isIosBuild

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: useRelativePublicPath ? './' : '/',
  productionSourceMap: !isExtensionBuild,
  configureWebpack: isExtensionBuild
    ? {
      mode: 'production',
      devtool: false,
      resolve: {
        alias: {
          '@/components/Drawer$': path.resolve(__dirname, 'src/components/ExtensionDrawer.js')
        }
      }
    }
    : {}
})

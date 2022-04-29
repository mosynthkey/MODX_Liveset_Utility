module.exports = {
    pages: {
        index: {
            entry: 'src/main.js',
            title: 'MODX SETLIST Utility',
        }
    },

    configureWebpack: {
      devtool: 'source-map'
    },

    pluginOptions: {
      quasar: {
        importStrategy: 'kebab',
        rtlSupport: true
      }
    },

    transpileDependencies: [
      'quasar'
    ],

    outputDir: 'docs',
    assetsDir: './',
    publicPath: './',
}

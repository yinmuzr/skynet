const CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default;

module.exports = {
  publicPath: '/',
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL,
        ws: true,
        changeOrigin: true,
      },
    },
  },

  configureWebpack: {
    optimization: {
      splitChunks: {
        cacheGroups: {
          iview: {
            test: /[\\/]node_modules[\\/](iview)[\\/]/,
            name: 'iview',
            chunks: 'all',
          },
          elementUI: {
            test: /[\\/]node_modules[\\/](element-ui)[\\/]/,
            name: 'element-ui',
            chunks: 'all',
          },
        },
      },
    },
    plugins: [
      new CSSSplitWebpackPlugin({
        size: 3000,
        filename: 'css/[name]-[part].[ext]',
      }),
    ],
  },
};

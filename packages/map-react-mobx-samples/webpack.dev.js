const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

const config = (env = {}) => {
    return webpackMerge(commonConfig(env),{
        mode: 'development',
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            port: 8080,
            historyApiFallback: true,
            proxy: {
                '/eumetsat': {
                    target: 'https://wms.eumetsat.int/geoserver/ows',
                    secure: false,
                    changeOrigin: true,
                    pathRewrite: {
                      '^/eumetsat': ''
                    }
                }
            }
        }
    });
}

module.exports = config;

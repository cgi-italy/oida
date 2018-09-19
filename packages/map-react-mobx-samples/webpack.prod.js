const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = (env) => {
    return webpackMerge(commonConfig(env),{
        mode: 'production',
        devtool: 'source-map',
        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: '../bundle-report.html',
                openAnalyzer: false
            })
        ]
    });
}

module.exports = config;

const path = require('path');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const webpack = require('webpack');

const config = (env = {}) => {
    return webpackMerge(commonConfig({
        mode: 'development',
        ...env
    }),{
        mode: 'development',
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            port: 1984,
            hot: true
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 0,
                                sourceMap: true,
                                import: false,
                                modules: false
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin()
        ]
    });
}

module.exports = config;

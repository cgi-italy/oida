const path = require('path');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const webpack = require('webpack');

const config = (env = {}) => {
    return webpackMerge(commonConfig(env),{
        mode: 'development',
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            port: 1984,
            historyApiFallback: true,
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
                                modules: false,
                                minimize: true
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

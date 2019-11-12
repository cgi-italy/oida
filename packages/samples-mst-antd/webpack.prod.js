const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = (env = {}) => {
    return webpackMerge(commonConfig(env),{
        mode: 'production',
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
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
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: '../bundle-report.html',
                openAnalyzer: false
            }),
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: "[name].[hash].bundle.css",
                chunkFilename: "[id].[hash].css"
            })
        ]
    });
}

module.exports = config;

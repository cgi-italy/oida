const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const cesiumConfig = require('@cgi-eo/map-cesium/config/webpack.cesium.js');
const webpackMerge = require('webpack-merge');

const config = (env = {}) => {
    return webpackMerge(cesiumConfig({nodeModulesDir: '../../node_modules'}),
    {
        entry: {
            app: './src/app.tsx'
        },
        output: {
            path: env.outpath || path.resolve(__dirname, "dist"),
            filename: '[name].[hash].bundle.js',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {}
                        }
                    ],
                },
                {
                    exclude: /node_modules/,
                    test: /\.(jsx?|map)$/,
                    enforce: 'pre',
                    use: [
                        {
                            loader: 'source-map-loader'
                        }
                    ]
                },
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
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'assets/images/[name].[hash].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'assets/fonts/[name].[hash].[ext]'
                            }
                        }
                    ]
                },
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.ejs',
                baseUrl: env.baseUrl || '/'
            }),
            new MiniCssExtractPlugin({
                filename: "[name].[hash].bundle.css",
                chunkFilename: "[id].[hash].css"
            })
        ]
    })
};


module.exports = config;

const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const oidaNodeModulesDir = '../../node_modules';
const cesiumSource = 'cesium/Build/Cesium';
const cesiumBaseUrl = 'Cesium';

module.exports = function (context, options) {
    return {
        name: 'custom-webpack-config',
        configureWebpack(config, isServer, utils) {
            // enable examples debugging
            return {
                devtool: 'eval-source-map',
                resolve: {
                    extensions: ['.ts', '.tsx', '.js', '.jsx'],
                    symlinks: false,
                    fallback: {
                        http: false,
                        https: false,
                        zlib: false,
                        url: false
                    },
                    alias: {
                        // use workspace react (otherwise two different version of react will be used)
                        react: path.resolve('../../node_modules/react'),
                        'react-dom': path.resolve('../../node_modules/react-dom')
                    }
                },
                snapshot: {
                    // by default webpack does not track changes to node_modules directory
                    // when working with linked oida/poieo libraries we want to track changes to them
                    managedPaths: [/node_modules\/(!@oidajs)/]
                },
                module: {
                    rules: [
                        {
                            include: /oidajs[/\\]/,
                            test: /\.jsx?$/,
                            enforce: 'pre',
                            use: [
                                {
                                    loader: 'source-map-loader'
                                }
                            ]
                        },
                        {
                            test: /\.jsx?$/,
                            include: /node_modules[/\\]ol[/\\]/,
                            use: [
                                {
                                    loader: 'babel-loader',
                                    options: {
                                        presets: [
                                            '@babel/typescript',
                                            [
                                                '@babel/env',
                                                {
                                                    targets: 'ie 11'
                                                }
                                            ]
                                        ],
                                        sourceMaps: false
                                    }
                                }
                            ]
                        }
                    ]
                },
                plugins: [
                    new webpack.DefinePlugin({
                        // Define relative base path in cesium for loading assets
                        CESIUM_BASE_URL: 'Cesium'
                    }),
                    new CopyWebpackPlugin({
                        patterns: [
                            { from: path.join(oidaNodeModulesDir, cesiumSource, 'Workers'), to: `${cesiumBaseUrl}/Workers` },
                            { from: path.join(oidaNodeModulesDir, cesiumSource, 'Assets'), to: `${cesiumBaseUrl}/Assets` },
                            { from: path.join(oidaNodeModulesDir, cesiumSource, 'Widgets'), to: `${cesiumBaseUrl}/Widgets` }
                        ]
                    })
                ]
            };
        }
    };
};

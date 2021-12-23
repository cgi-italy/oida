const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const oidaNodeModulesDir = '../../node_modules';
const cesiumSource = 'cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const cesiumBaseUrl = 'Cesium';

const cesiumAbsPath = path.resolve(`${__dirname}/../../../../node_modules/cesium`);

module.exports = function (context, options) {
    return {
        name: 'custom-webpack-config',
        configureWebpack(config, isServer, utils) {
            // enable examples debugging
            return {
                devtool: 'eval-source-map',
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
                        }
                    ]
                },
                resolve: {
                    alias: {
                        // to address this issue: https://github.com/CesiumGS/cesium/issues/9212
                        cesium: cesiumAbsPath
                    }
                },
                plugins: [
                    new webpack.DefinePlugin({
                        // Define relative base path in cesium for loading assets
                        CESIUM_BASE_URL: 'Cesium'
                    }),
                    new CopyWebpackPlugin({
                        patterns: [
                            { from: path.join(oidaNodeModulesDir, cesiumSource, cesiumWorkers), to: `${cesiumBaseUrl}/Workers` },
                            { from: path.join(oidaNodeModulesDir, cesiumSource, 'Assets'), to: `${cesiumBaseUrl}/Assets` },
                            { from: path.join(oidaNodeModulesDir, cesiumSource, 'Widgets'), to: `${cesiumBaseUrl}/Widgets` }
                        ]
                    })
                ]
            };
        }
    };
};

const path = require('path');

const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const cesiumSource = 'cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

const config = (config = {}) => {

    const nodeModulesDir = config.nodeModulesDir || 'node_modules';
    const cesiumBaseUrl = config.cesiumBaseUrl || 'Cesium';

    return {
        amd: {
            // Enable webpack-friendly use of require in Cesium
            toUrlUndefined: true
        },
        output: {
            sourcePrefix: ''
        },
        resolve: {
            alias: {
                // to address this issue: https://github.com/CesiumGS/cesium/issues/9212
                cesium: '/node_modules/cesium/'
            }
        },
        plugins: [
            new webpack.DefinePlugin({
                // Define relative base path in cesium for loading assets
                CESIUM_BASE_URL: JSON.stringify(`${cesiumBaseUrl}`)
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.join(nodeModulesDir, cesiumSource, cesiumWorkers), to: `${cesiumBaseUrl}/Workers` },
                    { from: path.join(nodeModulesDir, cesiumSource, 'Assets'), to: `${cesiumBaseUrl}/Assets` },
                    { from: path.join(nodeModulesDir, cesiumSource, 'Widgets'), to: `${cesiumBaseUrl}/Widgets` }
                ]
            })
        ]
    }
};


module.exports = config;

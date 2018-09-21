const path = require('path');

const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const cesiumSource = 'cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

const config = (config = {}) => {

    let nodeModulesDir = config.nodeModulesDir || 'node_modules';

    return {
        amd: {
            // Enable webpack-friendly use of require in Cesium
            toUrlUndefined: true
        },
        output: {
            sourcePrefix: ''
        },
        node: {
            fs: 'empty',
        },
        module: {
            unknownContextCritical: false,
        },
        plugins: [
            new webpack.DefinePlugin({
                // Define relative base path in cesium for loading assets
                CESIUM_BASE_URL: JSON.stringify('')
            }),
            new CopyWebpackPlugin([
                { from: path.join(nodeModulesDir, cesiumSource, cesiumWorkers), to: 'Workers' },
                { from: path.join(nodeModulesDir, cesiumSource, 'Assets'), to: 'Assets' },
                { from: path.join(nodeModulesDir, cesiumSource, 'Widgets'), to: 'Widgets' }
            ])
        ]
    }
};


module.exports = config;

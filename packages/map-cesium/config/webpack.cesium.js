const path = require('path');

const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const cesiumSource = 'cesium/Build/Cesium';

const config = (config = {}) => {
    const nodeModulesDir = config.nodeModulesDir || 'node_modules';
    const cesiumBaseUrl = config.cesiumBaseUrl || 'Cesium';

    return {
        plugins: [
            new webpack.DefinePlugin({
                // Define relative base path in cesium for loading assets
                CESIUM_BASE_URL: JSON.stringify(`${cesiumBaseUrl}`)
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.join(nodeModulesDir, cesiumSource, 'Workers'), to: `${cesiumBaseUrl}/Workers` },
                    { from: path.join(nodeModulesDir, cesiumSource, 'Assets'), to: `${cesiumBaseUrl}/Assets` },
                    { from: path.join(nodeModulesDir, cesiumSource, 'Widgets'), to: `${cesiumBaseUrl}/Widgets` }
                ]
            })
        ]
    };
};

module.exports = config;

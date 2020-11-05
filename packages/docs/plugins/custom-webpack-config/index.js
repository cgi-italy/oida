const webpack = require('webpack');

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
                            include: /oida[\/\\]/,
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
                plugins: [
                    new webpack.DefinePlugin({
                        // Define relative base path in cesium for loading assets
                        CESIUM_BASE_URL: 'Cesium'
                    })
                ]
            }
        }
    };
};

const { convertLegacyToken } = require('@ant-design/compatible/lib');
const { theme } = require('antd/lib');
const { default: createAliasToken } = require('antd/lib/theme/util/alias');

const config = (config = {}) => {
    const mapToken = config.themeToken || createAliasToken(theme.defaultAlgorithm(theme.defaultSeed));
    const v4Token = convertLegacyToken(mapToken);

    let styleLoader = config.styleLoader || 'style-loader';

    let cssLoaderOptions = config.cssLoaderOptions || {
        sourceMap: true,
        modules: false
    };

    let lessLoaderOptions = config.lessLoaderOptions || {};
    let { lessOptions, ...otherLessLoaderOptions } = lessLoaderOptions;

    return {
        module: {
            rules: [
                {
                    test: /\.less$/,
                    use: [
                        styleLoader,
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                                ...cssLoaderOptions
                            }
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                sourceMap: true,
                                lessOptions: {
                                    ...lessOptions,
                                    javascriptEnabled: true,
                                    modifyVars: {
                                        ...v4Token,
                                        ...mapToken
                                    }
                                },
                                ...otherLessLoaderOptions
                            }
                        }
                    ]
                }
            ]
        }
    };
};

module.exports = config;

const tsImportPluginFactory = require('ts-import-plugin');

const config = (config = {}) => {

    let tsLoaderOptions = config.tsLoaderOptions || {};

    let {getCustomTransformers, ...otherTsLoaderOptions} = tsLoaderOptions;

    getCustomTransformers = getCustomTransformers || {};

    let styleLoader = config.styleLoader || 'style-loader';

    let cssLoaderOptions = config.cssLoaderOptions || {
        sourceMap: true,
        modules: false
    };

    let lessLoaderOptions = config.lessLoaderOptions || {};
    let {lessOptions, ...otherLessLoaderOptions} = lessLoaderOptions;

    return {
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                getCustomTransformers: () => ({
                                    before: [
                                        tsImportPluginFactory({
                                            libraryName: 'antd',
                                            libraryDirectory: 'lib',
                                            style: false
                                        }),
                                        ...getCustomTransformers.before || []
                                    ],
                                    after: [
                                        ...getCustomTransformers.after || []
                                    ]
                                }),
                                ...otherTsLoaderOptions
                            }
                        }
                    ],
                },
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
                                    javascriptEnabled: true
                                },
                                ...otherLessLoaderOptions
                            }
                        }
                    ]
                }
            ]
        }
    }
}

module.exports = config;

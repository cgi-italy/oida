const AntdScssThemePlugin = require('@inventium/antd-scss-theme-plugin');
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

    let sassLoadersOptions = config.sassLoaderOptions || {};
    let lessLoaderOptions = config.lessLoaderOptions || {
        javascriptEnabled: true
    };

    return {
        resolve: {
            alias: {
                '@oida/ui-react-antd': '@oida/ui-react-antd/src' //do not use built library in order for theme to work
            }
        },
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
                                            style: true
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
                    test: /\.(sass|scss)$/,
                    use: [
                        styleLoader,
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                                ...cssLoaderOptions
                            }
                        },
                        AntdScssThemePlugin.themify({
                            loader: 'sass-loader',
                            options: sassLoadersOptions
                        })
                    ]
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
                        AntdScssThemePlugin.themify({
                            loader: 'less-loader',
                            options: lessLoaderOptions
                        })
                    ]
                }
            ]
        },
        plugins: [
            new AntdScssThemePlugin(config.themePath)
        ]
    }
}

module.exports = config;

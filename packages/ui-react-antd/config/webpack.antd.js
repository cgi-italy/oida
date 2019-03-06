const webpack = require('webpack');
const AntdScssThemePlugin = require('antd-scss-theme-plugin');
const tsImportPluginFactory = require('ts-import-plugin');

const config = (config = {}) => {

    let tsLoaderOptions = config.tsLoaderOptions || {};

    tsLoaderOptions.customTransformers = tsLoaderOptions.customTransformers || {};

    let styleLoader = config.styleLoader || 'style-loader';

    let cssLoaderOptions = config.cssLoaderOptions || {
        sourceMap: true,
        modules: false,
        minimize: true
    };

    let sassLoadersOptions = config.sassLoaderOptions || {};
    let lessLoaderOptions = config.lessLoaderOptions || {};

    return {
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                getCustomTransformers: () => ({
                                    before: [
                                        tsImportPluginFactory({
                                            libraryName: 'antd',
                                            libraryDirectory: 'lib',
                                            style: true
                                        }),
                                        ...tsLoaderOptions.customTransformers.before || []
                                    ],
                                    after: [
                                        ...tsLoaderOptions.customTransformers.after || []
                                    ]
                                }),
                                ...tsLoaderOptions
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
            new AntdScssThemePlugin(config.themePath),
        ]
    }
}

module.exports = config;

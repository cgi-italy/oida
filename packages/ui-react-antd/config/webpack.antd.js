const config = (config = {}) => {

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

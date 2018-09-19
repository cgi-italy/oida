const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = ((env = {}) => {
    return {
        entry: {
            app: './src/app.tsx'
        },
        output: {
            path: env.outpath || path.resolve(__dirname, "dist"),
            filename: '[name].[hash].bundle.js',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {}
                        }
                    ],
                },
                {
                    exclude: /node_modules/,
                    test: /\.(jsx?|map)$/,
                    enforce: 'pre',
                    use: [
                        {
                            loader: 'source-map-loader'
                        }
                    ]
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'assets/images/[name].[hash].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'assets/fonts/[name].[hash].[ext]'
                            }
                        }
                    ]
                },
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.ejs',
                baseUrl: env.baseUrl || '/'
            })
        ]
    }
});


module.exports = config;

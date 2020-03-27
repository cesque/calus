/* eslint-env node */
const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
// Add to plugins to show bundle size inspector
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const pkg = require('./package.json');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const config = {
    context: path.resolve(__dirname, pkg.config.paths.js),
    entry: './calus.js',
    mode: nodeEnv,
    output: {
        library: 'Calus',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true,
        filename: 'calus.js',
        path: path.resolve(__dirname, pkg.config.paths.dist),
    },
    resolve: {
        modules: [
            path.resolve(__dirname, pkg.config.paths.js),
            'node_modules',
        ],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                        ],
                    },
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'eslint-loader',
                },
            },
        ],
    },
    optimization: {
        minimize: false,
    },
    devtool: isProd ? 'source-map' : 'eval-source-map',
    plugins: (function() {
        let plugins = [
            new webpack.DefinePlugin({
                __DEV__: JSON.stringify(JSON.parse(!isProd || 'false')),
                'process.env': {
                    NODE_ENV: JSON.stringify(nodeEnv),
                },
            }),
            // new BundleAnalyzerPlugin(),
        ]

        if (isProd) {
            plugins = plugins.concat([
                new webpack.BannerPlugin({
                    banner: `${pkg.name} - v${pkg.version}`,
                }),
            ])
        }

        return plugins;
    })(),
}

if (isProd) {
    config.optimization = {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
                terserOptions: {
                    beautify: false,
                    mangle: {
                        keep_fnames: true,
                    },
                    comments: false,
                },
            }),
        ],
    }
}

module.exports = config;

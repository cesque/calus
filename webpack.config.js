module.exports = {
    //...
    entry : "./calus.js",
    output: {
        library: 'Calus',
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true,
        filename: 'calus.lib.js',
    },
    // externals: {
    //     vue: 'Vue',
    //     luxon: 'luxon'
    // },
    module: {
        rules: [
                {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                    presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    mode: process.env.NODE_ENV ? process.env.NODE_ENV : 'production',
    resolve: {
        alias: {
            "vue$": "vue/dist/vue.esm.js",
        },
    }
};
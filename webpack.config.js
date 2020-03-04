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
    mode: process.env.NODE_ENV ? process.env.NODE_ENV : 'production',
    optimization: {
		// We no not want to minimize the code if not production
		minimize: process.env.NODE_ENV !== 'development' ? true : false
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
    resolve: {
        alias: {
            "vue$": "vue/dist/vue.esm.js",
        },
    }
};
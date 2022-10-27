module.exports = {
    configureWebpack: {
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "ts-loader",
                        options: {
                            appendTsSuffixTo: [/\.vue$/],
                            projectReferences: true
                        }
                    }
                },
                {
                    test: /\.lazy\.scss.theme$/,
                    use: [
                        {
                            loader: "style-loader",
                            options: {injectType: "lazyStyleTag"},
                        },
                        'css-loader',
                        'sass-loader'
                    ]
                }
            ]
        }
    }
    // chainWebpack: config => {
    //     config.module
    //         .rule("ts")
    //         .test(/\.tsx?$/)
    //         .use('ts-loader')
    //         .load("ts-loader")
    //         .end()
    // }
}

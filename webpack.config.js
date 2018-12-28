module.exports = {
    entry: {
        'gdui.min': __dirname + '/src/main.js'
    },
    output: {
        path: __dirname + '/dist/gdui/js', //打包后的文件存放的地方
        filename: '[name].js', //打包后输出文件的文件名
        publicPath: '/gdui/js/' //web服务器资源目录
    },
    devServer: {
        contentBase: './dist', //本地服务器所加载的页面所在的目录
        historyApiFallback: true, //不跳转
        inline: true //inline模式
    },
    devtool: 'none',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        js: [
                            {
                                loader: 'babel-loader',
                                options: {
                                    presets: ['env']
                                }
                            }
                        ],
                        css: [
                            {
                                loader: 'style-loader!css-loader!less-loader'
                            }
                        ]
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                },
                exclude: /node_modules/
            }
        ]
    },
    externals: {
        vue: 'vue'
    }
};

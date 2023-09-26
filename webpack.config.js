const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
// console.log(path.resolve(__dirname, "assets", "js"));//C:\Users\marua\OneDrive\바탕 화면\wetube\assets\js
module.exports = {
    entry: "./src/client/js/main.js",
    mode: 'development',
    watch: true,//콘솔창 2개로 볼수있게 함(프엔/백엔)
    plugins: [new MiniCssExtractPlugin({
        filename: "css/styles.css",
    })],
    output: {
        filename: "js/main.js",
        path: path.resolve(__dirname, "assets"),//정규표현식에선 .가 분류 커맨드이므로 그냥 .을 쓸려면 \.을 해줘야 된다.따라서 \.js는 .js이다
        clean: true,
    },
    module : {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ]
                    },         
                },
            },
            {
                test:/\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            }
        ]
    }
};
/**
 * ptservices build
 */
import path from 'path'

module.exports = {
    mode: "production",
    target: "electron-main",
    entry: {
        index: "./index.js"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    optimization: {
        minimize: true
    }
}

const path = require('path');

module.exports = {
  entry: './src/background.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: ["node_modules", path.resolve(__dirname, "src")],
    extensions: [".ts", ".js"],
    alias: {
        "../node_modules/inversify/dts/inversify": "../node_modules/inversify/lib/inversify",
        "../../node_modules/inversify/dts/inversify": "../../node_modules/inversify/lib/inversify"
    }
    //fallback: "./node_modules/inversify/dts/inversify"
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
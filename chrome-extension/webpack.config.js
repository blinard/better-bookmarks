const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = {
  entry: './src/background.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
            {
                //loader: 'awesome-typescript-loader',
                loader: 'ts-loader',
                options: {
                    logLevel: 'info'
                }
            }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: ["node_modules", path.resolve(__dirname, "src")],
    extensions: [".ts", ".js"],
    alias: {
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  } //,
//   plugins: [
//       new CheckerPlugin()
//   ]
};
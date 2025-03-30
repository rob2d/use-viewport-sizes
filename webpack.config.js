const path = require('path');
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules|bower_components|build)/,
        use: {
          loader: 'babel-loader',
        }
      }
    ]
  },
  plugins: [
    new CopyPlugin({
        patterns: [{
            from: path.join(__dirname, 'src', 'index.d.ts'),
            to: path.join(__dirname, 'build', 'index.d.ts')
        }]
    })
  ],
  externals: {
    'react': 'commonjs react'
  }
};
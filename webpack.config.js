const path = require('path');

module.exports = {
  entry: './src/webApp/index.jsx',
  output: {
    path: path.resolve(__dirname, 'src/public'),
    filename: 'webapp.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
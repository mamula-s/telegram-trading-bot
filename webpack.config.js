const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/webApp/index.jsx',
  output: {
    path: path.resolve(__dirname, 'src/public'),
    filename: 'webapp.bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }],
              ['@babel/preset-react', { runtime: 'automatic' }]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV || 'development',
        BASE_URL: process.env.BASE_URL || ''
      })
    })
  ],
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map'
};
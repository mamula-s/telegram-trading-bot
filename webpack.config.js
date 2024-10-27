const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
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
                            '@babel/preset-env',
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
        extensions: ['.js', '.jsx'],
        alias: {
            '@': path.resolve(__dirname, 'src/webApp')
        }
    },
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false
};
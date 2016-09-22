var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './public/scripts/ws-client.js',
    watch: true,
    output: { path: __dirname + "/public", filename: 'bundle.js' },
    module: {
        loaders: [
            {
                test: /.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
};
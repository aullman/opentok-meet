var webpack = require('webpack');

module.exports = {
    entry: './public/js/app.js',
    output: {
        path: './public/js/',
        filename: "appBundle.min.js"
    },
    devtool: 'source-map',
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css' }
        ]
    }
};

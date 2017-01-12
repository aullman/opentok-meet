var webpack = require('webpack');
var GitRevisionPlugin = require('git-revision-webpack-plugin');
var gitRevisionPlugin = new GitRevisionPlugin();

module.exports = {
    entry: {
        login: "./src/js/login/app.js",
        room: './src/js/app.js',
        screen: './src/js/screen/app.js',
        whiteboard: './src/js/whiteboard/app.js'
    },
    output: {
        path: './public/js/',
        filename: "[name].bundle.min.js",
        chunkFilename: "[id].chunk.min.js"
    },
    devtool: 'source-map',
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css' },
            // { test: /codemirror\/mode(?!.*(javascript|markdown)).*/, loader: 'null' }
        ]
    },
    plugins: [
      new webpack.DefinePlugin({
          VERSION: JSON.stringify(gitRevisionPlugin.version()),
          COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
          filename: "commons.min.js",
          name: "commons"
      })
    ]
};

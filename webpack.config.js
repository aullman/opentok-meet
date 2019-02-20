const webpack = require('webpack');
const path = require('path');
const GitRevisionPlugin = require('git-revision-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();

let version;
let commitHash;

try {
  version = JSON.stringify(gitRevisionPlugin.version());
  commitHash = JSON.stringify(gitRevisionPlugin.commithash());
} catch (e) {
  // In Heroku we're not running from a git repo and the commit hash is in the path
  version = JSON.stringify('unknown');
  commitHash = JSON.stringify(process.env.PWD);
}

const production = process.env.HEROKU || process.env.TRAVIS;

const config = {
  entry: {
    login: './src/js/login/app.js',
    room: './src/js/app.js',
    screen: './src/js/screen/app.js',
    whiteboard: './src/js/whiteboard/app.js',
  },
  output: {
    path: './public/js/',
    filename: '[name].bundle.min.js',
    chunkFilename: '[id].chunk.min.js',
  },
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.html$/, loader: 'raw' },
      // { test: /codemirror\/mode(?!.*(javascript|markdown)).*/, loader: 'null' }
    ],
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: version,
      COMMITHASH: commitHash,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      filename: 'commons.min.js',
      name: 'commons',
    }),
  ],
};

if (production) {
  // Add in dedupe, uglify and babel for production
  config.plugins = config.plugins.concat([
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ]);
  config.module.loaders = config.module.loaders.concat([
    {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules(?!\/(opentok-textchat|opentok-camera-filters|filterous))/,
      query: {
        presets: ['babel-preset-env'].map(require.resolve),
      },
    },
  ]);
}

module.exports = config;

const webpack = require('webpack');
const GitRevisionPlugin = require('git-revision-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();

module.exports = (config) => {
  const browser = process.env.BROWSER || 'chrome';
  config.set({

    basePath: '../',

    files: [
      'https://tbdev.tokbox.com/v2/js/opentok.js',
      'tests/unit/**/index.js',
    ],

    exclude: [
      'public/js/opentok.js',
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: [browser[0].toUpperCase() + browser.substr(1)],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit',
    },

    preprocessors: {
      'src/js/**/*.js': ['sourcemap', 'coverage'],
      'tests/unit/**/index.js': ['webpack', 'sourcemap'],
    },

    client: {
      clearContext: true,
    },

    webpack: {
      module: {
        loaders: [
          { test: /\.css$/, loader: 'style!css' },
          { test: /\.html$/, loader: 'raw' },
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules(?!\/(opentok-textchat|opentok-camera-filters|filterous))/,
            query: {
              presets: ['babel-preset-env'].map(require.resolve),
            },
          },
        ],
      },
      devtool: 'inline-source-map',
      plugins: [
        new webpack.DefinePlugin({
          VERSION: JSON.stringify(gitRevisionPlugin.version()),
          COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
        }),
      ],
    },

    webpackMiddleware: {
      noInfo: true,
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/',
    },

  });
};

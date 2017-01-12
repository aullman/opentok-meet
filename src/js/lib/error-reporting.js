var Raven = require('raven-js');
var RavenAngular = require('raven-js/plugins/angular');

module.exports = function installErrorReporting(angular) {
  Raven
    .config(
      'https://32febef98a3140ceb21ad35138178163@sentry.io/118721',
      {
        release: VERSION,
        tags: {
          commitHash: COMMITHASH
        },
        debug: true
      }
    )
    .addPlugin(RavenAngular, angular)
    .install();
};

var Raven = require('raven-js');

module.exports = function installErrorReporting() {
  Raven
    .config(
      'https://32febef98a3140ceb21ad35138178163@sentry.io/118721',
      {
        release: VERSION,
        debug: true
      }
    )
    .install();
};

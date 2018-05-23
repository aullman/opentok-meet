const errorReporting = require('../lib/error-reporting.js');

errorReporting();

// eslint-disable-next-line
window.$ = window.jQuery = require('jquery');
const angular = require('angular');

require('opentok-angular');

angular.module('opentok-meet', ['opentok']);

require('./controller.js');
require('./directive.js');
require('../sync-click.js');
require('../services.js');

require('../safari-electron-redirect.js');

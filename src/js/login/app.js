const errorReporting = require('../lib/error-reporting.js');

errorReporting();

const angular = require('angular');

require('./controller.js');

require('../safari-electron-redirect.js');

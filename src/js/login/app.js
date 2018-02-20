const errorReporting = require('../lib/error-reporting.js');

errorReporting();

require('angular');

require('./controller.js');

require('../safari-electron-redirect.js');

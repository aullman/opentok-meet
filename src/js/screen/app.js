window.$ = window.jQuery = require('jquery');
var angular = require('angular');

require('opentok-angular');

angular.module('opentok-meet', ['opentok']);

require('./controller.js');
require('./directive.js');
require('../sync-click.js');
require('../services.js');

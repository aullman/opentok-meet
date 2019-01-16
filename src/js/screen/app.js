// eslint-disable-next-line
window.$ = window.jQuery = require('jquery');
const angular = require('angular');

require('opentok-angular');

angular.module('opentok-meet', ['opentok']);

require('./controller.js');
require('./directive.js');
require('../services.js');

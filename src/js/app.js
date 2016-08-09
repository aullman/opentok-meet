/*jshint unused:false*/

window.$ = window.jQuery = require('jquery');
var angular = require('angular');

require('opentok-angular');
require('opentok-whiteboard');
require('opentok-whiteboard/opentok-whiteboard.css');
require('opentok-editor');
require('opentok-editor/opentok-editor.css');
require('ng-debounce/dist/ng-debounce.js');

angular.module('opentok-meet', ['opentok', 'opentok-whiteboard',
  'opentok-editor', 'debounce']);

require('./directives.js');
require('./sync-click.js');
require('./subscriber-stats.js');
require('./controllers.js');
require('./services.js');
require('./screen/directive.js');
require('./simulcast-service.js');

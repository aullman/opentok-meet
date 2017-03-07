/*jshint unused:false*/

window.$ = window.jQuery = require('jquery');
var angular = require('angular');

require('opentok-angular');
require('opentok-whiteboard');
require('opentok-whiteboard/opentok-whiteboard.css');
require('opentok-editor');
require('opentok-editor/opentok-editor.css');
require('opentok-textchat');
require('opentok-textchat/opentok-textchat.css');

angular.module('opentok-meet', ['opentok', 'opentok-whiteboard',
  'opentok-editor', 'opentok-textchat']);

require('./directives.js');
require('./sync-click.js');
require('./subscriber-stats.js');
require('./controllers.js');
require('./services.js');
require('./screen/directive.js');
require('./notifications.js');
require('./ot-errors.js');

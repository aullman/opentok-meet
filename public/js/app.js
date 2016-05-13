/*jshint unused:false*/

var opentokMeet = angular.module('opentok-meet', ['opentok', 'opentok-whiteboard',
  'opentok-editor']);

require('./lib/opentok-whiteboard/opentok-whiteboard.js');
require('./lib/opentok-whiteboard/opentok-whiteboard.css');

require('../css/main.css');
require('./directives.js');
require('./sync-click.js');
require('./subscriber-stats.js');
require('./controllers.js');
require('./services.js');
require('./screen/directive.js');

(function() {
  require('./common.js');

  var h264 = getParameterByName('h264') !== null;

  if (h264) {
    var origConnectionCreate = OT.Raptor.Message.connections.create;
    OT.Raptor.Message.connections.create = function (opts) {
      opts.capabilities.push('regeneration');
      return origConnectionCreate(opts);
    };
  }
})();

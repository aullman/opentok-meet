(function() {

  function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  var h264 = getParameterByName('h264') !== null;

  if (h264) {
    var origConnectionCreate = OT.Raptor.Message.connections.create;
    OT.Raptor.Message.connections.create = function (opts) {
      opts.capabilities.push('regeneration');
      return origConnectionCreate(opts);
    };
  }
})();

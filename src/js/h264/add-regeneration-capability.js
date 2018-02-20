const getParameterByName = require('./get-parameter-by-name.js');

const h264 = getParameterByName('h264') !== null;

if (h264) {
  const origConnectionCreate = OT.Raptor.Message.connections.create;
  OT.Raptor.Message.connections.create = (opts) => {
    opts.capabilities.push('regeneration');
    return origConnectionCreate(opts);
  };
}

module.exports = function (app, config) {
  app.get('/:room/screen', function(req, res) {
    res.render('screen', {
      room: req.param('room'),
      chromeExtensionId: config.chromeExtensionId,
      opentokJs: config.opentokJs
    });
  });
};

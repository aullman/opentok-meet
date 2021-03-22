module.exports = (app, config) => {
  app.get('/:room/screen', (req, res) => {
    res.render('screen', {
      room: req.param('room'),
      chromeExtensionId: config.chromeExtensionId,
      opentokJs: config.opentokJs,
      tokenRole: req.query.tokenRole,
    });
  });
};

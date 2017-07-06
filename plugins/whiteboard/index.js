module.exports = function (app, config) {
  app.get('/:room/whiteboard', function(req, res) {
    res.render('whiteboard', {
      opentokJs: config.opentokJs,
      room: req.param('room')
    });
  });
};

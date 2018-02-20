module.exports = (app, config) => {
  app.get('/:room/whiteboard', (req, res) => {
    res.render('whiteboard', {
      opentokJs: config.opentokJs,
      room: req.param('room'),
    });
  });
};

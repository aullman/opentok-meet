module.exports = function (app) {
  app.get('/:room/whiteboard', (req, res) => {
    res.render('whiteboard', {
      room: req.param('room'),
    });
  });
};

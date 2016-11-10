module.exports = function (app) {
  app.get('/:room/whiteboard', function(req, res) {
    res.render('whiteboard', {
      room: req.param('room')
    });
  });
};

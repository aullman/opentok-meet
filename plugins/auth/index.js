module.exports = (app, config, redis) => {
  app.get('/user/:id', (req, res) => {
    const userId = req.param('id');
    redis.hget('users', userId, (err, user) => {
      res.format({
        json() {
          if (err) {
            res.send(400, { err });
          } else if (!user) {
            res.send(404, {
              err: 'user not found',
            });
          } else {
            res.send(JSON.parse(user));
          }
        },
      });
    });
  });

  app.post('/user/:id', (req, res) => {
    const userId = req.param('id');
    redis.hget('users', userId, (err, user) => {
      if (user) {
        res.send(409, 'Conflict, user already exists');
      } else {
        user = {
          id: userId,
          name: req.param('name'),
          profilePic: req.param('profilePic'),
          phone: req.param('phone'),
          phoneVerified: false,
        };
        redis.hset('users', userId, JSON.stringify(user), (setErr) => {
          if (setErr) {
            res.send(400, setErr);
          } else {
            res.send(user);
          }
        });
      }
    });
  });

  // app.post('/user/:id/code', (req, res) => {

  // });

  // app.post('/user/:id/code/verify', (req, res) => {

  // });
};

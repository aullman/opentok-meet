const Nexmo = require('nexmo');

module.exports = (app, config, redis) => {
  const nexmo = new Nexmo({
    apiKey: config.nexmoKey,
    apiSecret: config.nexmoSecret,
    applicationId: config.nexmoAppId,
  });

  const getUser = userId => new Promise((resolve, reject) => {
    redis.hget('users', userId, (err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(user));
      }
    });
  });

  const setUser = user => new Promise((resolve, reject) => {
    redis.hset('users', user.id, JSON.stringify(user), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  const userRequests = {}; // Hash of user verify requests by userId
  const verifyRequest = user => new Promise((resolve, reject) => {
    nexmo.verify.request({
      number: user.phone,
      brand: 'SafeMeet',
    }, (err, request) => {
      if (err) {
        reject(err);
      } else {
        if (!userRequests[user.id]) {
          userRequests[user.id] = [];
        }
        userRequests[user.id].push(request.request_id);
        resolve(request);
      }
    });
  });

  const verifyCheck = (userId, code) => Promise.all(userRequests[userId].map(requestId =>
    new Promise((resolve, reject) => {
      nexmo.verify.check({
        request_id: requestId,
        code,
      }, (err, status) => {
        if (err) {
          reject(err);
        } else {
          resolve(status);
        }
      });
    }))).then((statuses) => {
    for (let i = 0; i < statuses.length; i += 1) {
      if (statuses[i].status === '0') {
        return true;
      }
    }
    return false;
  });

  const verifyMobileOrLandline = user => new Promise((resolve, reject) => {
    nexmo.numberInsight.get({
      level: 'standard',
      number: user.phone,
    }, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.current_carrier.network_type === 'mobile' || response.current_carrier.network_type === 'landline');
      }
    });
  });

  app.get('/user/:id', async (req, res) => {
    try {
      const userId = req.param('id');
      const user = await getUser(userId);
      if (user) {
        res.send(user);
      } else {
        res.send(404, {
          err: 'user not found',
        });
      }
    } catch (err) {
      res.send(400, { err });
    }
  });

  app.post('/user/:id', async (req, res) => {
    try {
      const userId = req.param('id');
      let user = await getUser(userId);
      if (user) {
        res.send(409, {
          err: 'Conflict, user already exists',
        });
      } else {
        user = {
          id: userId,
          name: req.param('name'),
          profilePic: req.param('profilePic'),
          phone: req.param('phone'),
          phoneVerified: false,
        };

        await setUser(user);
        res.send(user);
      }
    } catch (err) {
      res.send(400, { err });
    }
  });

  app.post('/user/:id/code', async (req, res) => {
    try {
      const userId = req.param('id');
      const user = await getUser(userId);
      if (!user) {
        res.send(404, {
          err: 'user not found',
        });
      } else if (user.phoneVerified) {
        res.send({
          msg: 'user already verified',
          user,
        });
      } else {
        const isMobileOrLandline = await verifyMobileOrLandline(user);
        if (!isMobileOrLandline) {
          throw 'Cannot use a virtual number'; // eslint-disable-line
        }
        const request = await verifyRequest(user);
        if (request.status !== '0') {
          throw request.error_text;
        }
        request.user = user;
        res.send(request);
      }
    } catch (err) {
      res.send(400, { err });
    }
  });

  app.post('/user/:id/code/verify', async (req, res) => {
    try {
      const userId = req.param('id');
      const user = await getUser(userId);
      if (user.phoneVerified) {
        res.send(user);
      } else {
        const code = req.param('code');
        const verified = await verifyCheck(userId, code);
        if (verified) {
          user.phoneVerified = true;
          delete userRequests[user.id];
          await setUser(user);
          res.send(user);
        } else {
          res.send(403, {
            err: 'code not verified',
          });
        }
      }
    } catch (err) {
      res.send(400, { err });
    }
  });
};

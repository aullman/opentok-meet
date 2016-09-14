var request = require('request');
var jwt = require('jwt-simple');

function Anvil(url) {
  var createJwtToken = function(props) {
    props = props || {};

    var claims = {
      iat: props.issuedAt || Math.floor((Date.now() / 1000)),
      exp: props.expire || Math.floor((Date.now() / 1000) + 300),
      iss: props.issuer,
      ist: props.issuerType,
      scope: props.scope,
      nonce: Math.random()
    };

    var token = jwt.encode(claims, props.secret);
    return token;
  };

  var generateJwtHeader = function(props) {
    var token = createJwtToken(props);

    return {'X-OPENTOK-AUTH': token};
  };

  var getSubscriberInfo = function(payload, done) {
    payload = payload || {};

    if (!payload.apiSecret) {
      done(new Error('apiSecret required'));
      return;
    }

    var endpoint = url + '/v2/project/' + payload.apiKey
          + '/session/' + payload.sessionId
          + '/subscriber/all/' + payload.subscriberId;

    var props = {
      issuer: payload.apiKey,
      secret: payload.apiSecret,
      issuerType: 'project',
      scope: 'session.read'
    };

    var header = generateJwtHeader(props);

    request({
      method: 'GET',
      uri: endpoint,
      headers: header,
      json: true
    }, function(err, res) {
      if (err) {
        done(err);
        return;
      } else if (res.statusCode !== 200) {
        console.log('error response ', res.statusCode, res.body);
        done(new Error('invalid response from anvil ' + res.statusCode));
        return;
      }

      done(null, res.body);
    });
  };

  return {
    getSubscriberInfo: getSubscriberInfo
  };
}

module.exports = Anvil;

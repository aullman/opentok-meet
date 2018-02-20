const request = require('request');
const jwt = require('jwt-simple');

function Anvil(url) {
  const createJwtToken = (props) => {
    props = props || {};

    const claims = {
      iat: props.issuedAt || Math.floor((Date.now() / 1000)),
      exp: props.expire || Math.floor((Date.now() / 1000) + 300),
      iss: props.issuer,
      ist: props.issuerType,
      scope: props.scope,
      nonce: Math.random(),
    };

    const token = jwt.encode(claims, props.secret);
    return token;
  };

  const generateJwtHeader = (props) => {
    const token = createJwtToken(props);

    return { 'X-OPENTOK-AUTH': token };
  };

  this.getSubscriberInfo = function getSubscriberInfo(payload, done) {
    payload = payload || {};

    if (!payload.apiSecret) {
      done(new Error('apiSecret required'));
      return;
    }

    const endpoint = `${url}/v2/project/${payload.apiKey}/session/${payload.sessionId}/subscriber/all/${payload.subscriberId}`;

    const props = {
      issuer: payload.apiKey,
      secret: payload.apiSecret,
      issuerType: 'project',
      scope: 'session.read',
    };

    const header = generateJwtHeader(props);

    request({
      method: 'GET',
      uri: endpoint,
      headers: header,
      json: true,
    }, (err, res) => {
      if (err) {
        done(err);
        return;
      } else if (res.statusCode !== 200) {
        console.log('error response ', res.statusCode, res.body);
        done(new Error(`invalid response from anvil ${res.statusCode}`));
        return;
      }

      done(null, res.body);
    });
  };
}

module.exports = Anvil;

module.exports = {
    "extends": "airbnb-base",
    "rules": {
      "no-console": 0,
      "no-param-reassign": 0, // In angular you do a lot of scope.something = something
    },
    "env": {
      "browser": true,
      "node": true,
    },
    "globals": {
      "angular": true,
      "$": true,
      "OT": true,
    }
};

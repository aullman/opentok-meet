module.exports = {
    "extends": "airbnb-base",
    "rules": {
      "no-console": 0,
      "no-param-reassign": 0, // In angular you do a lot of scope.something = something
      "comma-dangle": ["error", {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "ignore",
        "exports": "ignore",
        "functions": "ignore"
      }],
      "prefer-destructuring": 0,  // It doesn't work with IE11 without babel-polyfill
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

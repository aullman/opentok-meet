module.exports = {
    "extends": "airbnb-base",
    "rules": {
      "no-console": 0,
      "no-param-reassign": 0, // In angular you do a lot of scope.something = something
      "comma-dangle": ["error", {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        // this is disabled as we run our codebase through node
        "functions": "never"
      }],
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

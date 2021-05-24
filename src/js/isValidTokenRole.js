module.exports = function isValidTokenRole(tokenRole) {
  return /^(?:moderator|publisher|subscriber)$/.test(tokenRole);
};

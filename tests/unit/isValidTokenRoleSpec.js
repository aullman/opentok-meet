const isValidTokenRole = require('../../src/js/isValidTokenRole');

describe('isValidTokenRole', () => {
  const tokenRoles = ['moderator', 'publisher', 'subscriber'];

  tokenRoles.forEach((tokenRole) => {
    it(`should return true since token role ${tokenRole} is valid`, () => {
      expect(isValidTokenRole('moderator')).toBe(true);
    });

    const invalidTokenRole = `${tokenRole}s`;

    it(`should return false since token role ${invalidTokenRole} is invalid`, () => {
      expect(isValidTokenRole(invalidTokenRole)).toBe(false);
    });
  });
});

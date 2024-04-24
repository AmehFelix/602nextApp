module.exports = jest.fn().mockReturnValue({
  auth: {},
  signIn: jest.fn(),
  signOut: jest.fn(),
});
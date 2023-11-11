/* eslint-disable @typescript-eslint/no-var-requires */
require('@testing-library/jest-native/extend-expect');
const React = require('react');

const testUtils = require('./react_native/test-utils/testUtils');

jest.mock('expo-secure-store');
const mockedSecureStore = jest.mocked(require('expo-secure-store'));
mockedSecureStore.getItemAsync.mockResolvedValue(
  JSON.stringify({
    token: 'abc123',
    isPasswordExpired: false,
    expiresAt: '2100-01-01 00:00:00',
  })
);

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock')
);

afterEach(() => {
  testUtils.testQueryClient.clear();
});

global.React = React;

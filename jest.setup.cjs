/* eslint-disable @typescript-eslint/no-var-requires */
require('@testing-library/jest-native/extend-expect');
const React = require('react');

const testUtils = require('./react_native/test-utils/testUtils');

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock')
);

afterEach(() => {
  testUtils.testQueryClient.clear();
});

global.React = React;

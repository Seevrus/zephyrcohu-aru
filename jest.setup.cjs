/* eslint-disable @typescript-eslint/no-var-requires */
require('@testing-library/jest-native/extend-expect');
const React = require('react');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

global.React = React;

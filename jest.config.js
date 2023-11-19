/* eslint-disable import/no-default-export */
/* eslint-disable import/no-unused-modules */

const config = {
  preset: 'jest-expo',
  roots: ['<rootDir>/react_native/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  testTimeout: 30_000,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  verbose: true,
};

export default config;
